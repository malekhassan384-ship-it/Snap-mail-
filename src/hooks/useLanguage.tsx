import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale } from '../types/index.ts';
import { dictionaries, DictionaryStrings } from '../lib/dictionary.ts';
import { storageHelper } from '../lib/storageHelper.ts';

function detectDefaultLocale(): Locale {
  const saved = storageHelper.getLocale();
  if (saved === 'ar' || saved === 'en') {
    return saved;
  }
  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || '').toLowerCase();
    if (lang.startsWith('ar')) {
      return 'ar';
    }
  }
  return 'en';
}

export interface LanguageContextType {
  locale: Locale;
  t: DictionaryStrings;
  dir: 'rtl' | 'ltr';
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(detectDefaultLocale);

  const applyLocaleToDocument = useCallback((currentLocale: Locale) => {
    if (typeof document !== 'undefined') {
      const dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLocale;
      document.documentElement.dir = dir;
      if (currentLocale === 'ar') {
        document.body.classList.add('font-arabic');
      } else {
        document.body.classList.remove('font-arabic');
      }
    }
  }, []);

  useEffect(() => {
    applyLocaleToDocument(locale);
  }, [locale, applyLocaleToDocument]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      storageHelper.setLocale(next);
      applyLocaleToDocument(next);
    },
    [applyLocaleToDocument]
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  }, [locale, setLocale]);

  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr';
  const t = dictionaries[locale];

  return (
    <LanguageContext.Provider value={{ locale, t, dir, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
