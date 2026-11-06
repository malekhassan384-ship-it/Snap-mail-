import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { AddressBar } from './components/AddressBar.tsx';
import { MessageList } from './components/MessageList.tsx';
import { MessageView } from './components/MessageView.tsx';
import { ExpiredPanel } from './components/ExpiredPanel.tsx';
import { ErrorBanner } from './components/ErrorBanner.tsx';
import { QrDialog } from './components/QrDialog.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { AdSlot } from './components/AdSlot.tsx';
import { Footer } from './components/Footer.tsx';
import { useInbox } from './hooks/useInbox.ts';
import { useCountdown } from './hooks/useCountdown.ts';
import { useLanguage } from './hooks/useLanguage.tsx';
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

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<MailMessageDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
      {/* Header */}
      <Header onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Error Banner if errorText is active */}
        {errorText && (
          <ErrorBanner
            errorText={errorText}
            onRetry={status === 'error' ? () => create(selectedDuration) : refreshMessages}
          />
        )}

        {/* Ad slot (Phase 1: renders nothing unless VITE_ADS_ENABLED is 'true') */}
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
