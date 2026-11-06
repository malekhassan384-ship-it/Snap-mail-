import { CountdownLevel } from '../types/index.ts';

export interface CountdownState {
  remainingMs: number;
  formatted: string;
  level: CountdownLevel;
}

export function computeCountdown(expiresAt: number, now = Date.now()): CountdownState {
  const diff = expiresAt - now;

  if (diff <= 0) {
    return {
      remainingMs: 0,
      formatted: '00:00',
      level: 'expired',
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const formatted = hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;

  let level: CountdownLevel = 'ok';
  if (totalSeconds <= 30) {
    level = 'critical';
  } else if (totalSeconds <= 120) {
    level = 'warn';
  }

  return {
    remainingMs: diff,
    formatted,
    level,
  };
}
