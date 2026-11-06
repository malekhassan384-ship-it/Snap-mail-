import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.tsx';

interface QrDialogProps {
  isOpen: boolean;
  address: string;
  onClose: () => void;
}

export const QrDialog: React.FC<QrDialogProps> = ({ isOpen, address, onClose }) => {
  const { t } = useLanguage();
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Generate QR code in-browser dynamically
  useEffect(() => {
    if (isOpen && address) {
      import('qrcode')
        .then((QRCodeModule) => {
          const QRCode = QRCodeModule.default || QRCodeModule;
          return QRCode.toDataURL(address, {
            width: 240,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: {
              dark: '#0F1B3D',
              light: '#FFFFFF',
            },
          });
        })
        .then((url) => {
          setDataUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate QR code', err);
        });
    }
  }, [isOpen, address]);

  // Focus trap and accessibility
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-dialog-title"
        className="relative w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl border border-[#BFDBFE] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#BFDBFE]">
          <h2 id="qr-dialog-title" className="text-base font-semibold text-[#0F1B3D]">
            {t.qrTitle}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={t.close}
            className="p-2 text-[#5B6B8C] hover:text-[#0F1B3D] hover:bg-[#F0F7FF] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* QR Code Canvas/Image */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-3 bg-white border border-[#BFDBFE] rounded-xl shadow-xs">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`${t.qrTitle} - ${address}`}
                width={240}
                height={240}
                className="block mx-auto rounded"
              />
            ) : (
              <div className="w-[240px] h-[240px] flex items-center justify-center text-xs text-[#5B6B8C]">
                Loading QR...
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <span
              dir="ltr"
              className="inline-block text-sm font-mono font-medium text-[#0F1B3D] bg-[#F0F7FF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg select-all"
            >
              {address}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleCopy}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>{t.copy}</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-[#0F1B3D] bg-white border border-[#BFDBFE] hover:bg-[#F0F7FF] rounded-xl transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
