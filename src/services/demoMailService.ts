import {
  IMailProvider,
} from './mailService.ts';
import {
  InboxSession,
  MailMessageSummary,
  MailMessageDetail,
} from '../types/index.ts';

const SAMPLE_MESSAGES: MailMessageDetail[] = [
  {
    id: 'msg-demo-1',
    from: { address: 'auth@service.io', name: 'Auth Service' },
    to: [{ address: 'x98f2k@snapmail.com', name: 'SnapMail User' }],
    subject: 'Your Verification Code (549122)',
    intro: 'Your one-time security verification code is 549122. Valid for 10 minutes.',
    seen: false,
    hasAttachments: false,
    size: 2420,
    createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
    text: `Hello,

Your verification code is: 549122

Please enter this 6-digit code on the website to confirm your temporary email address.
If you did not request this, please disregard this email.

Thanks,
Security Team`,
    html: [
      `<div style="font-family: sans-serif; padding: 20px; color: #0F1B3D;">
        <h2 style="color: #2563EB; margin-top: 0;">Verification Code</h2>
        <p>Please enter this single-use code to authenticate your account:</p>
        <div style="background: #F0F7FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1D4ED8;">549122</span>
        </div>
        <p style="font-size: 13px; color: #5B6B8C;">This code expires in 10 minutes.</p>
      </div>`
    ],
    attachments: [],
  },
  {
    id: 'msg-demo-2',
    from: { address: 'support@cloudplatform.com', name: 'Support' },
    to: [{ address: 'x98f2k@snapmail.com', name: 'SnapMail User' }],
    subject: 'Welcome to Service',
    intro: 'Thank you for testing our service. Your disposable inbox is functioning properly.',
    seen: true,
    hasAttachments: true,
    size: 15420,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    text: `Welcome to the Platform!

Your account has been set up with your temporary email address. You have complete access to all testing tools and sandbox utilities.

Need help? Check out our quickstart guides.`,
    html: [
      `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #0F1B3D;">Welcome to the Platform!</h2>
        <p style="color: #5B6B8C; line-height: 1.6;">Your account has been set up with your temporary email address. You have complete access to all testing tools and sandbox utilities.</p>
        <p>Attached is your getting-started summary guide.</p>
      </div>`
    ],
    attachments: [
      {
        id: 'att-1',
        filename: 'getting_started_guide.pdf',
        contentType: 'application/pdf',
        size: 14200,
      }
    ],
  },
  {
    id: 'msg-demo-3',
    from: { address: 'newsletter@techweekly.org', name: 'Newsletter' },
    to: [{ address: 'x98f2k@snapmail.com', name: 'SnapMail User' }],
    subject: 'Weekly Digest',
    intro: 'Highlights of the week: web security, throwaway inboxes, and privacy improvements.',
    seen: true,
    hasAttachments: false,
    size: 4800,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    text: `Weekly Digest
Here are this week's top updates on privacy, anti-spam techniques, and temporary email tools.`,
    html: [
      `<div style="font-family: sans-serif; padding: 20px;">
        <h3 style="color: #2563EB;">Weekly Digest #42</h3>
        <p>Catch up on privacy updates and security architectures designed for modern web applications.</p>
      </div>`
    ],
    attachments: [],
  }
];

export class DemoMailService implements IMailProvider {
  private messages: MailMessageDetail[] = [...SAMPLE_MESSAGES];

  async createInbox(countdownMinutes = 10): Promise<InboxSession> {
    const now = Date.now();
    return {
      accountId: 'demo-acc-12345',
      address: 'x98f2k@snapmail.com',
      password: 'demo-password-secret-1234',
      token: 'demo-token-jwt-example',
      createdAt: now,
      expiresAt: now + countdownMinutes * 60 * 1000,
    };
  }

  async refreshToken(_address?: string, _password?: string): Promise<string> {
    return 'demo-token-jwt-example-refreshed';
  }

  async listMessages(_token?: string, _page?: number): Promise<MailMessageSummary[]> {
    return this.messages.map((m) => ({
      id: m.id,
      from: m.from,
      to: m.to,
      subject: m.subject,
      intro: m.intro,
      seen: m.seen,
      hasAttachments: m.hasAttachments,
      size: m.size,
      createdAt: m.createdAt,
    }));
  }

  async getMessage(_token: string, id: string): Promise<MailMessageDetail> {
    const found = this.messages.find((m) => m.id === id);
    if (!found) throw new Error('Message not found');
    return found;
  }

  async markSeen(_token: string, id: string): Promise<void> {
    this.messages = this.messages.map((m) =>
      m.id === id ? { ...m, seen: true } : m
    );
  }

  async deleteMessage(_token: string, id: string): Promise<void> {
    this.messages = this.messages.filter((m) => m.id !== id);
  }

  async deleteAccount(_token?: string, _accountId?: string): Promise<void> {
    this.messages = [];
  }
}

export const demoMailService = new DemoMailService();
