import { useState, useEffect, useRef, useCallback } from 'react';
import {
  InboxSession,
  InboxStatus,
  MailMessageSummary,
  MailMessageDetail,
} from '../types/index.ts';
import { mailService } from '../services/mailService.ts';
import { storageHelper } from '../lib/storageHelper.ts';
import { HttpError } from '../lib/retryHelper.ts';

export interface UseInboxReturn {
  session: InboxSession | null;
  messages: MailMessageSummary[];
  status: InboxStatus;
  errorText: string | null;
  keepInbox: boolean;
  selectedDuration: number;
  setInboxDuration: (minutes: number) => void;
  create: (countdownMinutes?: number) => Promise<void>;
  end: () => Promise<void>;
  extend: (extraMinutes?: number) => void;
  toggleKeepInbox: (keep: boolean) => void;
  refreshMessages: () => Promise<void>;
  getMessageDetail: (id: string) => Promise<MailMessageDetail>;
  deleteMessageItem: (id: string) => Promise<void>;
  markMessageSeen: (id: string) => Promise<void>;
}

export function useInbox(): UseInboxReturn {
  const [session, setSession] = useState<InboxSession | null>(() => {
    return storageHelper.loadSession();
  });
  const [messages, setMessages] = useState<MailMessageSummary[]>([]);
  const [status, setStatus] = useState<InboxStatus>(() => {
    const loaded = storageHelper.loadSession();
    if (loaded) {
      if (Date.now() >= loaded.expiresAt) {
        return 'expired';
      }
      return 'ready';
    }
    return 'idle';
  });
  const [errorText, setErrorText] = useState<string | null>(null);
  const [keepInbox, setKeepInboxState] = useState<boolean>(() => {
    return storageHelper.getKeepInbox();
  });

  const [selectedDuration, setSelectedDuration] = useState<number>(10);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const sessionRef = useRef<InboxSession | null>(session);
  sessionRef.current = session;
  const statusRef = useRef<InboxStatus>(status);
  statusRef.current = status;
  const selectedDurationRef = useRef<number>(selectedDuration);
  selectedDurationRef.current = selectedDuration;

  const clearTimer = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  /**
   * End the current inbox:
   * Clears storage and state first, then tries to delete the mail.tm account.
   */
  const end = useCallback(async () => {
    clearTimer();
    const currentSession = sessionRef.current;
    storageHelper.clearSession();
    setSession(null);
    setStatus('expired');
    setMessages([]);

    if (currentSession?.token && currentSession.accountId) {
      try {
        await mailService.deleteAccount(currentSession.token, currentSession.accountId);
      } catch {
        // If deletion fails, ignore (mail.tm cleans abandoned accounts)
      }
    }
  }, []);

  /**
   * Creates a new inbox
   */
  const create = useCallback(
    async (countdownMinutes?: number) => {
      clearTimer();
      const minutes = countdownMinutes ?? selectedDurationRef.current;

      // If an inbox was already active, end it first cleanly
      if (sessionRef.current) {
        const oldSession = sessionRef.current;
        storageHelper.clearSession();
        try {
          await mailService.deleteAccount(oldSession.token, oldSession.accountId);
        } catch {
          // Ignore
        }
      }

      setStatus('creating');
      setErrorText(null);
      setMessages([]);

      try {
        const newSession = await mailService.createInbox(minutes);
        const shouldKeep = storageHelper.getKeepInbox();
        storageHelper.saveSession(newSession, shouldKeep);
        setSession(newSession);
        setStatus('ready');
      } catch (err: unknown) {
        let msg = 'Failed to create inbox';
        if (err instanceof HttpError) {
          msg = `Failed to create inbox (HTTP ${err.status})`;
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setErrorText(msg);
        setStatus('error');
      }
    },
    []
  );

  /**
   * Updates duration for current inbox and future ones
   */
  const setInboxDuration = useCallback((minutes: number) => {
    setSelectedDuration(minutes);
    selectedDurationRef.current = minutes;
    setSession((prev) => {
      if (!prev) return null;
      const now = Date.now();
      const newExpiresAt = now + minutes * 60 * 1000;
      const updated: InboxSession = {
        ...prev,
        expiresAt: newExpiresAt,
      };
      const shouldKeep = storageHelper.getKeepInbox();
      storageHelper.saveSession(updated, shouldKeep);
      return updated;
    });
  }, []);

  /**
   * Extends the inbox countdown by 10 minutes (or 1 hour if multi-hour selected)
   */
  const extend = useCallback((extraMinutes?: number) => {
    setSession((prev) => {
      if (!prev) return null;
      const now = Date.now();
      const addMinutes = extraMinutes ?? (selectedDurationRef.current >= 60 ? 60 : 10);
      const newExpiresAt = Math.max(prev.expiresAt, now) + addMinutes * 60 * 1000;
      const updated: InboxSession = {
        ...prev,
        expiresAt: newExpiresAt,
      };
      const shouldKeep = storageHelper.getKeepInbox();
      storageHelper.saveSession(updated, shouldKeep);
      return updated;
    });
  }, []);

  /**
   * Toggle keep this inbox in local storage
   */
  const toggleKeepInbox = useCallback((keep: boolean) => {
    setKeepInboxState(keep);
    storageHelper.setKeepInbox(keep, sessionRef.current);
  }, []);

  /**
   * Fetches messages with 401 token-refresh fallback
   */
  const fetchMessagesOnce = useCallback(async () => {
    const curSession = sessionRef.current;
    if (!curSession || statusRef.current !== 'ready') return;

    // Check expiry first
    if (Date.now() >= curSession.expiresAt) {
      await end();
      return;
    }

    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const list = await mailService.listMessages(curSession.token);
      setMessages(list);
      setErrorText(null);
    } catch (err: unknown) {
      if (err instanceof HttpError && err.status === 401) {
        // Attempt token refresh once
        try {
          const newToken = await mailService.refreshToken(
            curSession.address,
            curSession.password
          );
          const updatedSession: InboxSession = {
            ...curSession,
            token: newToken,
          };
          const shouldKeep = storageHelper.getKeepInbox();
          storageHelper.saveSession(updatedSession, shouldKeep);
          setSession(updatedSession);
          // Try fetching once more with new token
          const list = await mailService.listMessages(newToken);
          setMessages(list);
          setErrorText(null);
        } catch {
          // Token refresh failed, treat inbox as expired
          await end();
        }
      } else {
        // Show connection problem text, but keep polling
        setErrorText('connectionProblem');
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [end]);

  const refreshMessages = useCallback(async () => {
    await fetchMessagesOnce();
  }, [fetchMessagesOnce]);

  // Read message detail
  const getMessageDetail = useCallback(
    async (id: string): Promise<MailMessageDetail> => {
      const curSession = sessionRef.current;
      if (!curSession) throw new Error('No active inbox');
      return await mailService.getMessage(curSession.token, id);
    },
    []
  );

  // Mark seen
  const markMessageSeen = useCallback(
    async (id: string): Promise<void> => {
      const curSession = sessionRef.current;
      if (!curSession) return;
      try {
        await mailService.markSeen(curSession.token, id);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, seen: true } : m))
        );
      } catch {
        // Ignore failure
      }
    },
    []
  );

  // Delete message
  const deleteMessageItem = useCallback(
    async (id: string): Promise<void> => {
      const curSession = sessionRef.current;
      if (!curSession) return;
      try {
        await mailService.deleteMessage(curSession.token, id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } catch {
        // Ignore failure
      }
    },
    []
  );

  // Polling loop: 5s when tab is visible, 30s when tab is hidden
  useEffect(() => {
    if (status !== 'ready' || !session) {
      clearTimer();
      return;
    }

    let isMounted = true;

    const scheduleNextPoll = () => {
      if (!isMounted || statusRef.current !== 'ready') return;
      clearTimer();
      const isVisible = typeof document !== 'undefined' ? !document.hidden : true;
      const interval = isVisible ? 5000 : 30000;

      pollTimerRef.current = setTimeout(async () => {
        if (!isMounted) return;
        await fetchMessagesOnce();
        scheduleNextPoll();
      }, interval);
    };

    // Initial fetch on entering ready state
    fetchMessagesOnce();
    scheduleNextPoll();

    // Visibility change handler to reschedule immediately if tab becomes visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        scheduleNextPoll();
      } else {
        // Recalculate immediately when returning to tab
        fetchMessagesOnce();
        scheduleNextPoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, session?.accountId, fetchMessagesOnce]);

  return {
    session,
    messages,
    status,
    errorText,
    keepInbox,
    selectedDuration,
    setInboxDuration,
    create,
    end,
    extend,
    toggleKeepInbox,
    refreshMessages,
    getMessageDetail,
    deleteMessageItem,
    markMessageSeen,
  };
}
