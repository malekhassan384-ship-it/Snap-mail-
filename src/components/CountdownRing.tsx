import React from 'react';
import { CountdownLevel } from '../types/index.ts';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface CountdownRingProps {
  formatted: string;
  level: CountdownLevel;
  progressPercent: number;
  announcedWarn: boolean;
  onExtend: () => void;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  formatted,
  level,
  progressPercent,
  announcedWarn,
  onExtend,
}) => {
  const { t } = useLanguage();

  // SVG circular dimensions
  const radius = 42;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  // Progress stroke offset
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  let strokeColor = '#2563EB'; // ok: blue-600
  let textColor = '#2563EB';
  let pulseClass = '';

  if (level === 'warn') {
    strokeColor = '#1D4ED8'; // warn: blue-700
    textColor = '#1D4ED8';
  } else if (level === 'critical') {
    strokeColor = '#DC2626'; // critical: error-600
    textColor = '#DC2626';
    pulseClass = 'animate-pulse';
  }

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      {/* Screen reader announcement for warn level once only */}
      <div className="sr-only" aria-live="polite">
        {announcedWarn ? `${t.appName}: ${t.expiringSoon}` : ''}
      </div>

      <div className="relative flex items-center justify-center w-[108px] h-[108px]">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Background track: sky-200 */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#BFDBFE"
            strokeWidth={strokeWidth}
          />
          {/* Active ring progress */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-[stroke-dashoffset] duration-500 ease-linear ${pulseClass}`}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center px-1">
          <span
            className={`font-bold font-mono tracking-tight ${
              formatted.length > 5 ? 'text-base font-semibold' : 'text-xl'
            } ${textColor}`}
            aria-label={`${t.expiresIn}: ${formatted}`}
          >
            {formatted}
          </span>
          {level === 'warn' && (
            <span className="text-[10px] font-medium text-[#1D4ED8] -mt-0.5">
              {t.expiringSoon}
            </span>
          )}
          {level === 'critical' && (
            <span className="text-[10px] font-semibold text-[#DC2626] -mt-0.5">
              {t.expiringSoon}
            </span>
          )}
        </div>
      </div>

      {/* Extend button */}
      <button
        onClick={onExtend}
        className="mt-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors py-1 px-3 rounded hover:bg-[#F0F7FF] cursor-pointer whitespace-nowrap"
        title={formatted.length > 5 ? t.extendHours : t.extend10m}
      >
        {formatted.length > 5 ? t.extendHours : t.extend10m}
      </button>
    </div>
  );
};
