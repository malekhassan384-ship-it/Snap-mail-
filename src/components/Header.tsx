import React from 'react';
import { HelpCircle, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface HeaderProps {
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp }) => {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <header className="w-full bg-white border-b border-[#BFDBFE] py-3.5 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: SnapMail Brand Name (always English, bold italic, blue-600) */}
        <div className="shrink-0">
          <span className="snapmail-brand text-2xl md:text-3xl select-none tracking-tight">
            SnapMail
          </span>
        </div>

        {/* Zone 2 & 3: Actions & Language Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#5B6B8C] hover:text-[#2563EB] hover:bg-[#F0F7FF] rounded-xl transition-colors cursor-pointer"
            title={t.helpTitle}
            aria-label={t.helpTitle}
          >
            <HelpCircle className="w-4 h-4 text-[#2563EB]" />
            <span className="hidden sm:inline">{t.helpButton}</span>
          </button>

          {/* Language Toggle: AR / EN */}
          <button
            onClick={toggleLocale}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#2563EB] bg-[#F0F7FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-xl transition-colors cursor-pointer"
            title={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            aria-label={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="font-mono uppercase tracking-wider">
              {locale === 'ar' ? 'EN' : 'AR'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
