import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Zap, Lock, Mail } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t, locale } = useLanguage();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="relative w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl border border-[#BFDBFE] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#BFDBFE]">
          <h2 id="help-modal-title" className="text-lg font-bold text-[#0F1B3D]">
            {t.helpTitle}
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label={t.close}
            className="p-2 text-[#5B6B8C] hover:text-[#0F1B3D] hover:bg-[#F0F7FF] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-sm text-[#0F1B3D]">
          <p className="leading-relaxed text-[#5B6B8C]">
            {t.helpContent}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-[#0F1B3D] mb-0.5">
                  {locale === 'ar' ? 'فوري وبدون تسجيل' : 'Instant & No Sign-up'}
                </strong>
                <span className="text-[11px] text-[#5B6B8C] leading-snug">
                  {locale === 'ar' ? 'يعمل فور فتح الصفحة بدون كلمات مرور أو تسجيل' : 'Ready in ~2 seconds right in your browser.'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-[#0F1B3D] mb-0.5">
                  {locale === 'ar' ? 'أمان فائق وعزل تام' : 'Sandboxed & Safe'}
                </strong>
                <span className="text-[11px] text-[#5B6B8C] leading-snug">
                  {locale === 'ar' ? 'عرض الرسائل داخل إطار معزول بدون نصوص برمجية خبيثة' : 'Isolated iframe viewer with DOMPurify sanitization.'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-[#0F1B3D] mb-0.5">
                  {locale === 'ar' ? 'اكتشاف تلقائي لرموز التحقق' : 'One-Tap OTP Chips'}
                </strong>
                <span className="text-[11px] text-[#5B6B8C] leading-snug">
                  {locale === 'ar' ? 'استخراج رموز التفعيل 4-8 أرقام بضغطة زر' : 'Extracts verification numbers automatically.'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-[#0F1B3D] mb-0.5">
                  {locale === 'ar' ? 'حذف تلقائي نهائي' : 'Auto-Destruction'}
                </strong>
                <span className="text-[11px] text-[#5B6B8C] leading-snug">
                  {locale === 'ar' ? 'حذف الحساب والرسائل نهائياً عند انتهاء الوقت' : 'Deletes inbox and messages when timer hits zero.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#BFDBFE] flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
