import { useLanguage } from '../hooks/useLanguage.tsx';

export const AdSlot: React.FC = () => {
  const { t } = useLanguage();
  const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true';

  if (!adsEnabled) {
    return null;
  }

  // Phase 1 placeholder only
  return (
    <div
      className="my-4 p-4 border border-dashed border-[#BFDBFE] rounded-xl bg-[#F0F7FF] text-center text-xs text-[#5B6B8C]"
      role="complementary"
      aria-label={t.advertisement}
    >
      <span className="font-medium uppercase tracking-wider">{t.advertisement}</span>
    </div>
  );
};
