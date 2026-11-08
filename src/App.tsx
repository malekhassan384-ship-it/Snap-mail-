import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { AddressBar } from './components/AddressBar.tsx';
import { MessageList } from './components/MessageList.tsx';
import { MessageView } from './components/MessageView.tsx';
import { ExpiredPanel } from './components/ExpiredPanel.tsx';
import { ErrorBanner } from './components/ErrorBanner.tsx';
import { QrDialog } from './components/QrDialog.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { AccountModal } from './components/AccountModal.tsx';
import { AdSlot } from './components/AdSlot.tsx';
import { Footer } from './components/Footer.tsx';
import { useInbox } from './hooks/useInbox.ts';
import { useCountdown } from './hooks/useCountdown.ts';
import { useLanguage } from './hooks/useLanguage.tsx';
import { useAuth } from './hooks/useAuth.tsx';
import { MailMessageDetail } from './types/index.ts';

export default function App() {
  const {
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
  } = useInbox();

  const { t } = useLanguage();
  const { user, isOwner, siteStats, recordNewInbox } = useAuth();

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<MailMessageDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const recordedAddressesRef = useRef<Set<string>>(new Set());

  // Hook for countdown timer
  const {
    formatted: countdownFormatted,
    level: countdownLevel,
    progressPercent: countdownProgress,
    announcedWarn,
  } = useCountdown(session?.expiresAt, session?.createdAt, end);

  // Initial creation on mount if status is idle
  useEffect(() => {
    if (status === 'idle') {
      create(10);
    }
  }, [status, create]);

  // Record newly created session to Cloud/Firestore for logged-in user and global stats
  useEffect(() => {
    if (session?.address && !recordedAddressesRef.current.has(session.address)) {
      recordedAddressesRef.current.add(session.address);
      recordNewInbox(session.address, `${selectedDuration}m`).catch((err) => {
        console.warn('Background sync for new inbox:', err);
      });
    }
  }, [session?.address, selectedDuration, recordNewInbox]);

  // Handle browser back button navigation on mobile
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || !event.state.messageId) {
        setSelectedMessageId(null);
        setSelectedMessageDetail(null);
      } else {
        const id = event.state.messageId;
        setSelectedMessageId(id);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch full message details when a message is selected
  const handleSelectMessage = useCallback(
    async (id: string) => {
      setSelectedMessageId(id);
      setIsLoadingDetail(true);

      // Push browser history state for mobile back button support
      if (typeof window !== 'undefined') {
        window.history.pushState({ messageId: id }, '', `#message-${id}`);
      }

      try {
        const detail = await getMessageDetail(id);
        setSelectedMessageDetail(detail);
        await markMessageSeen(id);
      } catch (err) {
        console.error('Failed to load message detail', err);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [getMessageDetail, markMessageSeen]
  );

  const handleBackToList = useCallback(() => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.back();
    }
  }, []);

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      await deleteMessageItem(id);
      if (selectedMessageId === id) {
        handleBackToList();
      }
    },
    [deleteMessageItem, selectedMessageId, handleBackToList]
  );

  const handleNewInbox = useCallback(() => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
    create(selectedDuration);
  }, [create, selectedDuration]);

  const isExpired = status === 'expired' || (status === 'ready' && !!session && countdownLevel === 'expired');
  const isCreating = status === 'creating';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F1B3D]">
      {/* Header with Auth & Owner controls */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Special Owner Welcome & Verification Banner */}
        {isOwner && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Crown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm md:text-base font-bold text-amber-950">
                    {t.ownerGreeting}
                  </h2>
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                </div>
                <p className="text-xs text-amber-900/80 truncate">
                  {t.ownerWelcomeBanner}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-semibold text-amber-950">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100/90 border border-amber-300">
                    👥 {t.siteVisitors}: {siteStats.visitorsCount.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100/90 border border-amber-300">
                    👤 {t.signedInUsers}: {(siteStats.signedInUsersCount ?? 1).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100/90 border border-amber-300">
                    ✉️ {t.inboxesGenerated}: {siteStats.inboxesGeneratedCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAccountOpen(true)}
              className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shrink-0 border border-amber-300 shadow-xs self-start md:self-auto"
            >
              {t.ownerDashboard}
            </button>
          </div>
        )}

        {/* Error Banner if errorText is active */}
        {errorText && (
          <ErrorBanner
            errorText={errorText}
            onRetry={status === 'error' ? () => create(selectedDuration) : refreshMessages}
          />
        )}

        {/* Ad slot */}
        <AdSlot />

        {isExpired ? (
          /* Expired State Panel */
          <ExpiredPanel onNewInbox={handleNewInbox} isCreating={isCreating} />
        ) : (
          <>
            {/* Top Address Bar & Countdown Card */}
            <AddressBar
              address={session?.address || null}
              isCreating={isCreating}
              keepInbox={keepInbox}
              selectedDuration={selectedDuration}
              onSelectDuration={setInboxDuration}
              onCopyAddress={() => {}}
              onOpenQr={() => setIsQrOpen(true)}
              onNewInbox={handleNewInbox}
              onToggleKeepInbox={toggleKeepInbox}
              onExtend={extend}
              countdownFormatted={countdownFormatted}
              countdownLevel={countdownLevel}
              countdownProgress={countdownProgress}
              announcedWarn={announcedWarn}
            />

            {/* Split Screen or Single Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 items-start">
              {/* Message List: Hidden on mobile if viewing message */}
              <div className={`${selectedMessageId ? 'hidden md:block' : 'block'}`}>
                <MessageList
                  messages={messages}
                  selectedId={selectedMessageId}
                  isLoading={isCreating}
                  onSelectMessage={handleSelectMessage}
                  onRefresh={refreshMessages}
                />
              </div>

              {/* Message Details Pane: Hidden on mobile unless message is selected */}
              <div className={`${!selectedMessageId ? 'hidden md:block' : 'block'}`}>
                <MessageView
                  message={selectedMessageDetail}
                  isLoading={isLoadingDetail}
                  onBack={handleBackToList}
                  onDelete={handleDeleteMessage}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Account & Owner Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* QR Dialog Modal */}
      <QrDialog
        isOpen={isQrOpen}
        address={session?.address || ''}
        onClose={() => setIsQrOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
