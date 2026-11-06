import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Image as ImageIcon,
  Copy,
  Check,
  Paperclip,
  KeyRound,
  Mail,
} from 'lucide-react';
import { MailMessageDetail } from '../types/index.ts';
import { useLanguage } from '../hooks/useLanguage.tsx';
import { sanitizeEmailHtml, buildSandboxedSrcDoc } from '../lib/safeHtml.ts';
import { findVerificationCodes } from '../lib/codeFinder.ts';

interface MessageViewProps {
  message: MailMessageDetail | null;
  isLoading: boolean;
  onBack: () => void;
  onDelete: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const MessageView: React.FC<MessageViewProps> = ({
  message,
  isLoading,
  onBack,
  onDelete,
}) => {
  const { t, dir, locale } = useLanguage();
  const [allowRemoteImages, setAllowRemoteImages] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Reset image permissions when viewing a different message
  React.useEffect(() => {
    setAllowRemoteImages(false);
  }, [message?.id]);

  // Extract OTP / verification codes from message text and subject
  const verificationCodes = useMemo(() => {
    if (!message) return [];
    const sourceText = `${message.subject || ''}\n${message.text || ''}\n${message.intro || ''}`;
    return findVerificationCodes(sourceText);
  }, [message]);

  // Sanitize HTML and prepare sandboxed srcdoc
  const sanitizedSrcDoc = useMemo(() => {
    if (!message) return '';
    const rawHtml = Array.isArray(message.html)
      ? message.html.join('')
      : typeof message.html === 'string'
      ? message.html
      : '';

    if (!rawHtml) return '';

    const cleanHtml = sanitizeEmailHtml(rawHtml, {
      allowRemoteImages,
      imagesBlockedText: t.imagesBlocked,
    });

    return buildSandboxedSrcDoc(cleanHtml, dir);
  }, [message, allowRemoteImages, t.imagesBlocked, dir]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // Fallback
    }
  };

  if (isLoading) {
    return (
      <div className="snap-card h-[520px] p-6 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-[#5B6B8C]">Loading message...</span>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="snap-card h-[520px] p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mb-4">
          <Mail className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h3 className="text-base font-bold text-[#0F1B3D] mb-1.5">
          {t.openMessagePane}
        </h3>
        <p className="text-xs text-[#5B6B8C] max-w-xs leading-relaxed">
          {t.selectMessagePrompt}
        </p>
      </div>
    );
  }

  const senderName = message.from.name || message.from.address;
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="snap-card flex flex-col h-[520px] overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-[#BFDBFE] flex items-center justify-between gap-3 bg-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-2 text-[#5B6B8C] hover:text-[#0F1B3D] hover:bg-[#F0F7FF] rounded-lg transition-colors cursor-pointer"
            aria-label={t.backToList}
            title={t.backToList}
          >
            <BackIcon className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#0F1B3D] truncate" title={message.subject || t.noSubject}>
              {message.subject || t.noSubject}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#5B6B8C] truncate mt-0.5">
              <span>{t.from}: <strong className="text-[#0F1B3D]">{senderName}</strong></span>
              <span aria-hidden="true">·</span>
              <span dir="ltr" className="text-slate-400 truncate">{message.from.address}</span>
            </div>
          </div>
        </div>

        {/* Delete action */}
        <button
          onClick={() => onDelete(message.id)}
          className="p-2 text-[#5B6B8C] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
          title={t.deleteMessage}
          aria-label={t.deleteMessage}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Verification Code Highlight Banner */}
      {verificationCodes.length > 0 && (
        <div className="p-3 bg-[#F0F7FF] border-b border-[#BFDBFE] flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8]">
            <KeyRound className="w-4 h-4 text-[#2563EB]" />
            <span>{t.codeChipLabel}:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {verificationCodes.map((code) => {
              const isCopied = copiedCode === code;
              return (
                <button
                  key={code}
                  onClick={() => handleCopyCode(code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#2563EB] text-[#2563EB] hover:bg-[#DBEAFE] rounded-lg text-sm font-mono font-bold tracking-widest shadow-xs transition-colors cursor-pointer"
                  title={`${t.copy} ${code}`}
                >
                  <span dir="ltr">{code}</span>
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#2563EB]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Remote Images Bar (if not yet loaded) */}
      {!allowRemoteImages && (
        <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <span>{t.imagesBlocked}</span>
          <button
            onClick={() => setAllowRemoteImages(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-900 bg-white border border-amber-300 rounded hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{t.loadImages}</span>
          </button>
        </div>
      )}

      {/* Message Content: sandboxed iframe or plain text block */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {sanitizedSrcDoc ? (
          <iframe
            srcDoc={sanitizedSrcDoc}
            title={message.subject || 'Email message'}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            className="w-full h-full border-0"
          />
        ) : (
          <div className="p-6 h-full overflow-y-auto whitespace-pre-wrap font-sans text-sm text-[#0F1B3D] leading-relaxed">
            {message.text || message.intro || '(Empty message)'}
          </div>
        )}
      </div>

      {/* Attachments Section (Names & sizes only, no direct external download links) */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="p-3 bg-[#F0F7FF] border-t border-[#BFDBFE] shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6B8C] mb-2">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{t.attachments} ({message.attachments.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#BFDBFE] rounded-lg text-xs text-[#0F1B3D]"
              >
                <span className="font-medium truncate max-w-[180px]">{att.filename}</span>
                <span className="text-[10px] text-[#5B6B8C] tabular-nums">({formatBytes(att.size)})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
