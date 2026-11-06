import { useState, useEffect, useRef, useCallback } from 'react';
import { CountdownLevel } from '../types/index.ts';
import { computeCountdown } from '../lib/countdown.ts';

export interface UseCountdownReturn {
  remainingMs: number;
  formatted: string;
  level: CountdownLevel;
  totalDurationMs: number;
  progressPercent: number;
  announcedWarn: boolean;
}

export function useCountdown(
  expiresAt: number | null | undefined,
  createdAt?: number,
  onExpire?: () => void
): UseCountdownReturn {
  const [state, setState] = useState(() => {
    if (!expiresAt) {
      return { remainingMs: 10 * 60 * 1000, formatted: '10:00', level: 'ok' as CountdownLevel };
    }
    return computeCountdown(expiresAt);
  });

  const [announcedWarn, setAnnouncedWarn] = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const expiredFiredRef = useRef(false);

  const tick = useCallback(() => {
    if (!expiresAt) {
      setState({ remainingMs: 10 * 60 * 1000, formatted: '10:00', level: 'ok' });
      return;
    }
    const current = computeCountdown(expiresAt);
    setState(current);

    if (current.level === 'warn') {
      setAnnouncedWarn(true);
    }

    if (current.level === 'expired' && !expiredFiredRef.current) {
      expiredFiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [expiresAt]);

  useEffect(() => {
    expiredFiredRef.current = false;
    setAnnouncedWarn(false);
    tick();

    if (!expiresAt) return;

    const interval = setInterval(tick, 1000);

    const handleVisibility = () => {
      if (!document.hidden) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [expiresAt, tick]);

  const initialSpan = expiresAt && createdAt ? expiresAt - createdAt : 10 * 60 * 1000;
  const totalDurationMs = Math.max(initialSpan, state.remainingMs, 10 * 60 * 1000);
  const progressPercent = Math.min(
    100,
    Math.max(0, (state.remainingMs / totalDurationMs) * 100)
  );

  return {
    remainingMs: state.remainingMs,
    formatted: state.formatted,
    level: state.level,
    totalDurationMs,
    progressPercent,
    announcedWarn,
  };
}
