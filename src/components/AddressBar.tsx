import React, { useState } from 'react';
import { Copy, Check, QrCode, RefreshCw, BookmarkCheck, Clock } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';
import { CountdownRing } from './CountdownRing.tsx';
import { CountdownLevel } from '../types/index.ts';

interface AddressBarProps {
  address: string | null;
  isCreating: boolean;
  keepInbox: boolean;
  selectedDuration: number;
  onSelectDuration: (minutes: number) => void;
  onCopyAddress: () => void;
  onOpenQr: () => void;
  onNewInbox: () => void;
  onToggleKeepInbox: (keep: boolean) => void;
  onExtend: () => void;
  countdownFormatted: string;
  countdownLevel: CountdownLevel;
  countdownProgress: number;
  announcedWarn: boolean;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  address,
  isCreating,
  keepInbox,
  selectedDuration,
  onSelectDuration,
  onCopyAddress,
  onOpenQr,
  onNewInbox,
  onToggleKeepInbox,
  onExtend,
  countdownFormatted,
  countdownLevel,
  countdownProgress,
  announcedWarn,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const DURATION_OPTIONS = [
    { minutes: 10, key: 'duration10m' as const },
    { minutes: 120, key: 'duration2h' as const },
    { minutes: 360, key: 'duration6h' as const },
    { minutes: 1440, key: 'duration24h' as const },
  ];

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopyAddress();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="snap-card p-5 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Address, Label, Actions, Duration */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#5B6B8C] uppercase tracking-wider">
              {t.yourAddress}
            </span>

            {/* Keep this inbox toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#5B6B8C] hover:text-[#0F1B3D] transition-colors">
              <input
                type="checkbox"
                checked={keepInbox}
                onChange={(e) => onToggleKeepInbox(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-[#BFDBFE] focus:ring-[#2563EB]"
              />
              <span className="hidden sm:inline">{t.keepInbox}</span>
              <BookmarkCheck
                className={`w-3.5 h-3.5 sm:hidden ${keepInbox ? 'text-[#2563EB]' : 'text-slate-400'}`}
                aria-hidden="true"
              />
            </label>
          </div>

          {/* Email Address Display */}
          <div className="my-2">
            {isCreating ? (
              <div className="h-8 md:h-10 bg-[#F0F7FF] rounded-lg animate-pulse w-3/4 max-w-md" />
            ) : address ? (
              <span
                dir="ltr"
                className="block text-[20px] md:text-[24px] font-mono font-bold text-[#0F1B3D] tracking-tight truncate select-all"
                title={address}
              >
                {address}
              </span>
            ) : (
              <span className="text-[#5B6B8C] italic text-base">
                {t.generatingAddress}
              </span>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            {/* Copy Button (Primary) */}
            <button
              onClick={handleCopy}
              disabled={!address || isCreating}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>

            {/* QR Code Button (Secondary) */}
            <button
              onClick={onOpenQr}
              disabled={!address || isCreating}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#2563EB] bg-white border border-[#2563EB] hover:bg-[#F0F7FF] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.qrTitle}</span>
            </button>

            {/* New Inbox Button (Secondary) */}
            <button
              onClick={onNewInbox}
              disabled={isCreating}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#0F1B3D] bg-white border border-[#BFDBFE] hover:bg-[#F0F7FF] hover:border-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 shrink-0 text-[#2563EB] ${isCreating ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{t.newInbox}</span>
            </button>
          </div>

          {/* Duration Selector Bar */}
          <div className="mt-4 pt-3.5 border-t border-[#F0F7FF] flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6B8C]">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
              <span>{t.durationLabel}:</span>
            </span>
            <div className="inline-flex flex-wrap items-center p-1 bg-[#F0F7FF] rounded-xl border border-[#BFDBFE] gap-1">
              {DURATION_OPTIONS.map((opt) => {
                const isActive = selectedDuration === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => onSelectDuration(opt.minutes)}
                    className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                        : 'text-[#0F1B3D] hover:bg-[#DBEAFE]/70'
                    }`}
                    title={t[opt.key]}
                    aria-pressed={isActive}
                  >
                    {t[opt.key]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Circular Countdown Ring */}
        <div className="flex items-center justify-center border-t md:border-t-0 md:border-s border-[#BFDBFE] pt-4 md:pt-0 md:ps-6">
          <CountdownRing
            formatted={countdownFormatted}
            level={countdownLevel}
            progressPercent={countdownProgress}
            announcedWarn={announcedWarn}
            onExtend={onExtend}
          />
        </div>
      </div>
    </div>
  );
};
