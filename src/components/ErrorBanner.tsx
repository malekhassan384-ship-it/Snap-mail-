import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface ErrorBannerProps {
  errorText: string;
  onRetry: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ errorText, onRetry }) => {
  const { t } = useLanguage();

  const displayMessage =
    errorText === 'connectionProblem'
      ? t.connectionProblem
      : errorText.startsWith('Failed to create inbox')
      ? t.createFailed
      : errorText;

  return (
    <div
      role="alert"
      className="mb-4 flex items-center justify-between gap-3 p-3.5 bg-red-50 border border-red-200 text-[#DC2626] rounded-xl text-sm"
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="font-medium">{displayMessage}</span>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#DC2626] hover:bg-red-700 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t.refresh}</span>
      </button>
    </div>
  );
};
