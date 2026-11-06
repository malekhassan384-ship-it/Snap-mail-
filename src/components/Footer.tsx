import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto py-6 px-4 border-t border-[#BFDBFE] bg-white text-center text-xs text-[#5B6B8C]">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-medium">
          Developed &amp; Designed by <strong className="text-[#0F1B3D]">Malek Hassan Ashour</strong>
        </span>
        <span className="text-[11px] text-slate-400">
          Clean &amp; Secure Disposable Email · No Tracking
        </span>
      </div>
    </footer>
  );
};
