export interface MailDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MailAddressItem {
  address: string;
  name: string;
}

export interface MailMessageSummary {
  id: string;
  from: MailAddressItem;
  to: MailAddressItem[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted?: boolean;
  hasAttachments: boolean;
  size: number;
  createdAt: string;
}

export interface MailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  disposition?: string;
  transferEncoding?: string;
  related?: boolean;
  downloadUrl?: string;
}

export interface MailMessageDetail extends MailMessageSummary {
  text: string;
  html: string[];
  attachments: MailAttachment[];
}

export interface InboxSession {
  accountId: string;
  address: string;
  password: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  keepLocal?: boolean;
}

export type InboxStatus = 'idle' | 'creating' | 'ready' | 'expired' | 'error';

export type CountdownLevel = 'ok' | 'warn' | 'critical' | 'expired';

export type Locale = 'ar' | 'en';

export interface UserProfileDoc {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'owner' | 'user';
  inboxesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedInboxDoc {
  id: string;
  userId: string;
  address: string;
  duration?: string;
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'expired';
}

export interface SiteStatsDoc {
  visitorsCount: number;
  inboxesGeneratedCount: number;
  updatedAt?: string;
}

