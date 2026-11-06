import { Locale } from '../types/index.ts';

export function formatRelativeTime(dateStr: string, locale: Locale): string {
  try {
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) return '';

    const diffSec = Math.floor((Date.now() - timestamp) / 1000);

    if (diffSec < 45) {
      return locale === 'ar' ? 'الآن' : 'Just now';
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return locale === 'ar' ? `منذ ${diffMin} د` : `${diffMin}m ago`;
    }

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return locale === 'ar' ? `منذ ${diffHours} س` : `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return locale === 'ar' ? `منذ ${diffDays} ي` : `${diffDays}d ago`;
  } catch {
    return '';
  }
}
