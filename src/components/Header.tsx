import React from 'react';
import { HelpCircle, Globe, Crown, User, Sparkles } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';
import { useAuth } from '../hooks/useAuth.tsx';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp, onOpenAccount }) => {
  const { locale, toggleLocale, t } = useLanguage();
  const { user, isOwner } = useAuth();

  return (
    <header className="w-full bg-white border-b border-[#BFDBFE] py-3.5 px-4 md:px-8 sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: SnapMail Brand Name (always English, bold italic, blue-600) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="snapmail-brand text-2xl md:text-3xl select-none tracking-tight">
            SnapMail
          </span>
          {isOwner && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 border border-amber-300 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.ownerBadge}</span>
            </span>
          )}
        </div>

        {/* Zone 2 & 3: Actions, Auth & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Account / Owner Button */}
          {user ? (
            <button
              onClick={onOpenAccount}
              className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer shadow-xs ${
                isOwner
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200 text-amber-950 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-[#F0F7FF] hover:bg-[#DBEAFE] text-[#0F1B3D] border-[#BFDBFE]'
              }`}
              title={isOwner ? t.ownerGreeting : t.accountDetails}
              aria-label={isOwner ? t.ownerGreeting : t.accountDetails}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-black/10"
                />
              ) : isOwner ? (
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <User className="w-4 h-4 text-[#2563EB] shrink-0" />
              )}
              <span className="hidden md:inline max-w-[130px] truncate">
                {isOwner ? t.ownerBadge : user.displayName || user.email?.split('@')[0]}
              </span>
              {isOwner && <Sparkles className="w-3.5 h-3.5 text-amber-500 hidden sm:inline" />}
            </button>
          ) : (
            <button
              onClick={onOpenAccount}
              className="min-h-[44px] inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              title={t.signInWithGoogle}
              aria-label={t.signInWithGoogle}
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.8h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.82.525 3.87 1.41l2.58-2.58C17.07 3.33 14.805 2.4 12.24 2.4 6.96 2.4 2.64 6.72 2.64 12s4.32 9.6 9.6 9.6c5.52 0 9.18-3.87 9.18-9.36 0-.645-.075-1.275-.195-1.955H12.24z" />
              </svg>
              <span>{t.signIn}</span>
            </button>
          )}

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
