import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface ExpiredPanelProps {
  onNewInbox: () => void;
  isCreating: boolean;
}

export const ExpiredPanel: React.FC<ExpiredPanelProps> = ({ onNewInbox, isCreating }) => {
  const { t } = useLanguage();

  return (
    <div className="snap-card p-8 md:p-12 my-8 text-center max-w-xl mx-auto border-[#BFDBFE]">
      <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-[#DC2626] mx-auto flex items-center justify-center mb-5">
        <Clock className="w-8 h-8" />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-[#0F1B3D] mb-2.5">
        {t.expiredTitle}
      </h2>

      <p className="text-sm text-[#5B6B8C] leading-relaxed mb-6 max-w-md mx-auto">
        {t.expiredDesc}
      </p>

      <button
        onClick={onNewInbox}
        disabled={isCreating}
        className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 text-base font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-xl transition-all shadow-sm cursor-pointer"
      >
        <RefreshCw className={`w-5 h-5 ${isCreating ? 'animate-spin' : ''}`} />
        <span>{t.createNewInbox}</span>
      </button>
    </div>
  );
};
