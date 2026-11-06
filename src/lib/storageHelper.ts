import { InboxSession } from '../types/index.ts';

const SESSION_STORAGE_KEY = 'snapmail_session';
const LOCAL_STORAGE_KEY = 'snapmail_session_persistent';
const KEEP_INBOX_KEY = 'snapmail_keep_inbox';
const LOCALE_KEY = 'snapmail_locale';

// In-memory fallback if storage is blocked/restricted (e.g. private browsing mode)
let memorySession: InboxSession | null = null;
let memoryKeepInbox: boolean = false;
let memoryLocale: string | null = null;

export const storageHelper = {
  loadSession(): InboxSession | null {
    try {
      // Check session storage first
      const sessionRaw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionRaw) {
        return JSON.parse(sessionRaw) as InboxSession;
      }
      // Check local storage if keep this inbox is enabled
      const localRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localRaw) {
        return JSON.parse(localRaw) as InboxSession;
      }
    } catch {
      // Storage blocked or unavailable
    }
    return memorySession;
  },

  saveSession(session: InboxSession, keepLocal = false): void {
    memorySession = session;
    session.keepLocal = keepLocal;
    const serialized = JSON.stringify(session);
    try {
      if (keepLocal) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      // Storage blocked
    }
  },

  clearSession(): void {
    memorySession = null;
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Storage blocked
    }
  },

  setKeepInbox(keep: boolean, currentSession?: InboxSession | null): void {
    memoryKeepInbox = keep;
    try {
      window.localStorage.setItem(KEEP_INBOX_KEY, keep ? 'true' : 'false');
      if (currentSession) {
        this.saveSession(currentSession, keep);
      }
    } catch {
      // Storage blocked
    }
  },

  getKeepInbox(): boolean {
    try {
      const val = window.localStorage.getItem(KEEP_INBOX_KEY);
      return val === 'true';
    } catch {
      return memoryKeepInbox;
    }
  },

  getLocale(): string | null {
    try {
      return window.localStorage.getItem(LOCALE_KEY);
    } catch {
      return memoryLocale;
    }
  },

  setLocale(locale: string): void {
    memoryLocale = locale;
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // Storage blocked
    }
  }
};
