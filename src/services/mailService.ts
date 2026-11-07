import {
  MailDomain,
  MailMessageSummary,
  MailMessageDetail,
  InboxSession,
} from '../types/index.ts';
import { HttpError, retryOn429 } from '../lib/retryHelper.ts';
import { demoMailService } from './demoMailService.ts';

/**
 * Mail.tm API Safe Endpoints:
 * 1. GET /domains               -> Fetch available active domains
 * 2. POST /accounts             -> Create temporary account { address, password }
 * 3. POST /token                -> Acquire JWT Bearer token { address, password }
 * 4. GET /messages?page={n}     -> Retrieve inbox messages with Bearer token
 *
 * For Vercel & Netlify hosting:
 * - Local / Vite: proxied through vite.config.ts server.proxy['/api/mailtm']
 * - Vercel: proxied through vercel.json rewrites: /api/mailtm/:path* -> https://api.mail.tm/:path*
 * - Netlify: proxied through netlify.toml and public/_redirects
 */
const DIRECT_URL = 'https://api.mail.tm';
const PROXY_URL = '/api/mailtm';

// In browser runtime, default to /api/mailtm to prevent CORS issues on Vercel, Netlify & dev
let preferredBaseUrl = typeof window !== 'undefined' ? PROXY_URL : DIRECT_URL;

export interface IMailProvider {
  createInbox(countdownMinutes?: number): Promise<InboxSession>;
  refreshToken(address: string, password: string): Promise<string>;
  listMessages(token: string, page?: number): Promise<MailMessageSummary[]>;
  getMessage(token: string, id: string): Promise<MailMessageDetail>;
  markSeen(token: string, id: string): Promise<void>;
  deleteMessage(token: string, id: string): Promise<void>;
  deleteAccount(token: string, accountId: string): Promise<void>;
}

// Generate secure random string using crypto.getRandomValues (never Math.random)
function generateSecureString(length: number, charset: string): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = '';
  const charsetLen = charset.length;
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      result += charset[byte % charsetLen];
    }
  }
  return result;
}

export function generateRandomUsername(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const firstChar = 'abcdefghijklmnopqrstuvwxyz';
  const prefix = generateSecureString(1, firstChar);
  const rest = generateSecureString(length - 1, chars);
  return prefix + rest;
}

export function generateRandomPassword(length = 24): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return generateSecureString(length, chars);
}

function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') return true;
    if ((window as unknown as { __USE_DEMO_MAIL__?: boolean }).__USE_DEMO_MAIL__) return true;
  }
  return false;
}

function extractCollection<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && data !== null && 'hydra:member' in data) {
    return ((data as Record<string, unknown>)['hydra:member'] as T[]) || [];
  }
  return [];
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    contentType?: string;
  } = {}
): Promise<T> {
  const { method = 'GET', token, body, contentType = 'application/json' } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = contentType;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return retryOn429(async () => {
    let res: Response;
    try {
      res = await fetch(`${preferredBaseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      // If direct fetch to https://api.mail.tm failed due to CORS or network in browser, fallback to proxy
      if (preferredBaseUrl === DIRECT_URL && typeof window !== 'undefined') {
        try {
          res = await fetch(`${PROXY_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
          });
          preferredBaseUrl = PROXY_URL;
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    if (res.status === 204) {
      return {} as T;
    }

    if (!res.ok) {
      let errorData: unknown;
      try {
        errorData = await res.json();
      } catch {
        // Not JSON
      }
      throw new HttpError(res.status, `HTTP ${res.status}: ${res.statusText}`, errorData);
    }

    return (await res.json()) as T;
  });
}

export class MailTmService implements IMailProvider {
  /**
   * Fetches active public domains from mail.tm
   */
  async listDomains(): Promise<MailDomain[]> {
    if (isDemoMode()) {
      return [{ id: 'demo-domain-1', domain: 'snapmail.com', isActive: true, isPrivate: false }];
    }
    const data = await apiRequest<unknown>('/domains');
    return extractCollection<MailDomain>(data);
  }

  /**
   * Creates a new disposable inbox
   * 1. Fetches available domains (GET /domains)
   * 2. Picks first active and non-private domain
   * 3. Generates 10-char username and 24-char password via crypto.getRandomValues
   * 4. Creates account via POST /accounts
   * 5. Obtains JWT token via POST /token
   * 6. Calculates expiresAt (default 10 mins)
   */
  async createInbox(countdownMinutes = 10): Promise<InboxSession> {
    if (isDemoMode()) {
      return demoMailService.createInbox(countdownMinutes);
    }
    const domains = await this.listDomains();
    const activeDomain = domains.find((d) => d.isActive && !d.isPrivate);

    if (!activeDomain) {
      throw new Error('No active public email domains available');
    }

    const username = generateRandomUsername(10);
    const address = `${username}@${activeDomain.domain}`;
    const password = generateRandomPassword(24);

    // Create Account: POST /accounts
    interface CreateAccountResponse {
      id: string;
      address: string;
    }
    const account = await apiRequest<CreateAccountResponse>('/accounts', {
      method: 'POST',
      body: { address, password },
    });

    // Get Auth Token: POST /token
    interface TokenResponse {
      id: string;
      token: string;
    }
    const auth = await apiRequest<TokenResponse>('/token', {
      method: 'POST',
      body: { address, password },
    });

    const now = Date.now();
    const expiresAt = now + countdownMinutes * 60 * 1000;

    return {
      accountId: account.id || auth.id,
      address,
      password,
      token: auth.token,
      createdAt: now,
      expiresAt,
    };
  }

  /**
   * Refreshes JWT token with stored credentials: POST /token
   */
  async refreshToken(address: string, password: string): Promise<string> {
    if (isDemoMode()) {
      return demoMailService.refreshToken(address, password);
    }
    interface TokenResponse {
      token: string;
    }
    const auth = await apiRequest<TokenResponse>('/token', {
      method: 'POST',
      body: { address, password },
    });
    return auth.token;
  }

  /**
   * Fetches first page of messages: GET /messages?page=1
   */
  async listMessages(token: string, page = 1): Promise<MailMessageSummary[]> {
    if (isDemoMode()) {
      return demoMailService.listMessages(token, page);
    }
    const data = await apiRequest<unknown>(`/messages?page=${page}`, {
      token,
    });
    return extractCollection<MailMessageSummary>(data);
  }

  /**
   * Fetches full message details: GET /messages/{id}
   */
  async getMessage(token: string, id: string): Promise<MailMessageDetail> {
    if (isDemoMode()) {
      return demoMailService.getMessage(token, id);
    }
    return await apiRequest<MailMessageDetail>(`/messages/${id}`, {
      token,
    });
  }

  /**
   * Marks a message as seen: PATCH /messages/{id}
   */
  async markSeen(token: string, id: string): Promise<void> {
    if (isDemoMode()) {
      return demoMailService.markSeen(token, id);
    }
    await apiRequest<void>(`/messages/${id}`, {
      method: 'PATCH',
      token,
      contentType: 'application/merge-patch+json',
      body: { seen: true },
    });
  }

  /**
   * Deletes a specific message: DELETE /messages/{id}
   */
  async deleteMessage(token: string, id: string): Promise<void> {
    if (isDemoMode()) {
      return demoMailService.deleteMessage(token, id);
    }
    await apiRequest<void>(`/messages/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  /**
   * Permanently deletes the temporary account: DELETE /accounts/{id}
   */
  async deleteAccount(token: string, accountId: string): Promise<void> {
    if (isDemoMode()) {
      return demoMailService.deleteAccount(token, accountId);
    }
    await apiRequest<void>(`/accounts/${accountId}`, {
      method: 'DELETE',
      token,
    });
  }
}

// Single singleton provider instance
export const mailService: IMailProvider = new MailTmService();
