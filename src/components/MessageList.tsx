import { Mail, RefreshCw } from 'lucide-react';
import { MailMessageSummary } from '../types/index.ts';
import { useLanguage } from '../hooks/useLanguage.tsx';
import { formatRelativeTime } from '../lib/timeHelper.ts';

interface MessageListProps {
  messages: MailMessageSummary[];
  selectedId: string | null;
  isLoading: boolean;
  onSelectMessage: (id: string) => void;
  onRefresh: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedId,
  isLoading,
  onSelectMessage,
  onRefresh,
}) => {
  const { t, locale } = useLanguage();

  return (
    <div className="snap-card flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#BFDBFE] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#0F1B3D] tracking-tight">
            {t.messageList}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0F7FF] text-[#2563EB] border border-[#BFDBFE]">
            {messages.length}
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title={t.refresh}
          aria-label={t.refresh}
          className="p-2 text-[#5B6B8C] hover:text-[#2563EB] hover:bg-[#F0F7FF] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2563EB]' : ''}`} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F0F7FF]">
        {isLoading && messages.length === 0 ? (
          // Loading skeleton state
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-2 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-[#F0F7FF] rounded w-28" />
                  <div className="h-3 bg-[#F0F7FF] rounded w-12" />
                </div>
                <div className="h-4 bg-[#F0F7FF] rounded w-44" />
                <div className="h-3 bg-[#F0F7FF] rounded w-full" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          // Empty State with quiet pulse
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#F0F7FF] flex items-center justify-center text-[#2563EB] animate-pulse">
                <Mail className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1B3D] mb-1">{t.waiting}</p>
            <p className="text-xs text-[#5B6B8C] max-w-[240px] leading-relaxed">
              {t.emptyInboxDesc}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelected = msg.id === selectedId;
            const senderName = msg.from.name || msg.from.address;
            const subject = msg.subject || t.noSubject;
            const relativeTime = formatRelativeTime(msg.createdAt, locale);

            return (
              <button
                key={msg.id}
                onClick={() => onSelectMessage(msg.id)}
                className={`w-full text-start p-3.5 transition-colors cursor-pointer relative flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#DBEAFE]'
                    : 'hover:bg-[#F0F7FF] bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!msg.seen && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0"
                        title={t.unread}
                        aria-label={t.unread}
                      />
                    )}
                    <span
                      className={`text-xs truncate ${
                        !msg.seen
                          ? 'font-bold text-[#0F1B3D]'
                          : 'font-medium text-[#5B6B8C]'
                      }`}
                    >
                      {senderName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5B6B8C] shrink-0 tabular-nums">
                    {relativeTime}
                  </span>
                </div>

                <div
                  className={`text-sm truncate ${
                    !msg.seen ? 'font-semibold text-[#0F1B3D]' : 'text-[#0F1B3D]'
                  }`}
                >
                  {subject}
                </div>

                {msg.intro && (
                  <p className="text-xs text-[#5B6B8C] truncate line-clamp-1">
                    {msg.intro}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
