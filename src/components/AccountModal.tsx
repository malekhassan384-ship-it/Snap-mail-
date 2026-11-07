import React, { useState } from 'react';
import {
  X,
  Crown,
  Users,
  Mail,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Globe2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSavedInbox?: (address: string) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSelectSavedInbox,
}) => {
  const {
    user,
    userProfile,
    isOwner,
    loading,
    savedInboxes,
    siteStats,
    signInWithGoogle,
    logout,
    refreshStats,
  } = useAuth();
  const { t, locale } = useLanguage();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-[#BFDBFE] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className={`p-5 md:p-6 border-b flex items-center justify-between ${
          isOwner ? 'bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-amber-200' : 'bg-[#F0F7FF] border-[#BFDBFE]'
        }`}>
          <div className="flex items-center gap-3">
            {isOwner ? (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Crown className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Users className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#0F1B3D] flex items-center gap-2">
                {isOwner ? t.ownerDashboard : t.accountDetails}
                {isOwner && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {t.ownerBadge}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#5B6B8C]">
                {user ? user.email : t.cloudSyncNotice}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center text-[#5B6B8C] hover:text-[#0F1B3D] transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Not Logged In View */}
          {!user && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center border border-blue-200 shadow-sm">
                <Globe2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-[#0F1B3D]">
                  {locale === 'ar' ? 'سجل دخولك لحفظ بياناتك في السحاب' : 'Sign in to save your data in the cloud'}
                </h3>
                <p className="text-sm text-[#5B6B8C] leading-relaxed">
                  {t.cloudSyncNotice}
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {authError}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full max-w-sm mx-auto min-h-[48px] px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.8h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.82.525 3.87 1.41l2.58-2.58C17.07 3.33 14.805 2.4 12.24 2.4 6.96 2.4 2.64 6.72 2.64 12s4.32 9.6 9.6 9.6c5.52 0 9.18-3.87 9.18-9.36 0-.645-.075-1.275-.195-1.955H12.24z" />
                </svg>
                <span>{loading ? '...' : t.signInWithGoogle}</span>
              </button>
            </div>
          )}

          {/* Logged In View */}
          {user && (
            <>
              {/* Owner Special Greeting Banner */}
              {isOwner ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border-2 border-amber-300 shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-400 text-amber-950 rounded-xl shadow-xs shrink-0 mt-0.5">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-amber-950">
                        {t.ownerGreeting}
                      </h3>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {t.ownerWelcomeBanner}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F1B3D]">
                      {t.userGreeting}، {user.displayName || user.email}
                    </h3>
                    <p className="text-xs text-[#5B6B8C]">
                      {t.cloudSyncNotice}
                    </p>
                  </div>
                </div>
              )}

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Site Visitors Card (Prominent for Owner) */}
                <div className={`p-4 rounded-2xl border ${
                  isOwner ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-[#BFDBFE]'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#5B6B8C] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                      {t.siteVisitors}
                    </span>
                    {isOwner && (
                      <button
                        onClick={handleRefresh}
                        className={`text-[#2563EB] hover:text-[#1D4ED8] p-1 rounded-md hover:bg-blue-100 transition-colors ${
                          isRefreshing ? 'animate-spin' : ''
                        }`}
                        title={t.refresh}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[#0F1B3D] tracking-tight font-mono">
                    {siteStats.visitorsCount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#5B6B8C] mt-1">
                    {locale === 'ar' ? 'زائر حقيقي للموقع' : 'Unique site visitors'}
                  </p>
                </div>

                {/* Inboxes Generated Card */}
                <div className={`p-4 rounded-2xl border ${
                  isOwner ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-[#BFDBFE]'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#5B6B8C] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                      {t.inboxesGenerated}
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-[#2563EB] tracking-tight font-mono">
                    {siteStats.inboxesGeneratedCount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#5B6B8C] mt-1">
                    {locale === 'ar' ? 'إجمالي الصناديق المنشأة' : 'Total created inboxes'}
                  </p>
                </div>
              </div>

              {/* Cloud Saved Inboxes History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#0F1B3D] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2563EB]" />
                    {t.savedInboxes} ({savedInboxes.length})
                  </h4>
                </div>

                {savedInboxes.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1]">
                    <Mail className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                    <p className="text-xs text-[#64748B]">{t.noSavedInboxes}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {savedInboxes.map((inbox) => (
                      <div
                        key={inbox.id}
                        className="p-3 bg-[#F8FAFC] hover:bg-[#F0F7FF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-xl flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-mono font-semibold text-[#0F1B3D] truncate">
                            {inbox.address}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[#64748B] mt-0.5">
                            <span>{new Date(inbox.createdAt).toLocaleDateString()}</span>
                            {inbox.duration && (
                              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono">
                                {inbox.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopy(inbox.id, inbox.address)}
                            className="p-2 text-[#5B6B8C] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title={t.copy}
                          >
                            {copiedId === inbox.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {onSelectSavedInbox && (
                            <button
                              onClick={() => {
                                onSelectSavedInbox(inbox.address);
                                onClose();
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            >
                              {locale === 'ar' ? 'استخدام' : 'Use'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hosting & API Safe Verification Card */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-emerald-900">
                    {t.deploymentSafeBadge}
                  </p>
                  <p className="text-emerald-700 leading-relaxed text-[11px]">
                    {locale === 'ar'
                      ? 'تم تكوين نقاط Mail.tm (Domains, Accounts, Token, Messages) بمسار وكيل آمن (/api/mailtm) وملفات vercel.json و netlify.toml لتعمل فوراً دون أخطاء CORS عند النشر.'
                      : 'Mail.tm endpoints (Domains, Accounts, Token, Messages) are safely wired via proxy (/api/mailtm) with prebuilt vercel.json and netlify.toml configurations ready for instant production deployment.'}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-[11px] text-[#64748B]">
                  {locale === 'ar' ? 'حساب متصل بـ Firebase' : 'Connected to Firebase Cloud'}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.signOut}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
