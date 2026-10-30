import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getHostLanguage } from '@nimiq/mini-app-sdk';
import {
  translations,
  SupportedLanguage,
  TranslationKey,
  SUPPORTED_LANGUAGES,
  LanguageInfo,
} from './translations';

interface TranslationContextType {
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
  isNimiqDetected: boolean;
  supportedLanguages: LanguageInfo[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const STORAGE_KEY = 'payexpress_preferred_language';

/**
 * Implements Nimiq Pay 3-tier localization resolution:
 * 1. getHostLanguage() / window.nimiqPay?.language (injected by Nimiq Pay app before scripts run)
 * 2. User local override (from localStorage if manually changed)
 * 3. Browser locale (navigator.language)
 * 4. Fallback: 'en'
 */
function resolveInitialLanguage(): { lang: SupportedLanguage; fromNimiq: boolean } {
  // Check if Nimiq Pay injected language is present via SDK helper or host context
  const detected = getHostLanguage() || window.nimiqPay?.language;
  const nimiqLang = detected?.toLowerCase().split('-')[0] as SupportedLanguage | undefined;
  if (nimiqLang && nimiqLang in translations) {
    return { lang: nimiqLang, fromNimiq: true };
  }

  // Check manual user selection in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && saved in translations) {
      return { lang: saved, fromNimiq: false };
    }
  } catch {
    // ignore localStorage errors in sandboxed iframes
  }

  // Fallback to browser locale
  const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase() as SupportedLanguage;
  if (browserLang in translations) {
    return { lang: browserLang, fromNimiq: false };
  }

  return { lang: 'en', fromNimiq: false };
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<SupportedLanguage>(() => {
    return resolveInitialLanguage().lang;
  });

  const [isNimiqDetected, setIsNimiqDetected] = useState<boolean>(() => {
    return resolveInitialLanguage().fromNimiq;
  });

  useEffect(() => {
    // Listen for late injection of window.nimiqPay if mini-app initializes asynchronously
    if (window.nimiqPay?.language && !localStorage.getItem(STORAGE_KEY)) {
      const nimiqLang = window.nimiqPay.language.toLowerCase() as SupportedLanguage;
      if (nimiqLang in translations && nimiqLang !== currentLang) {
        setCurrentLangState(nimiqLang);
        setIsNimiqDetected(true);
      }
    }
  }, [currentLang]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLangState(lang);
    setIsNimiqDetected(false);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage error
    }
  };

  const t = useMemo(() => {
    const dict = translations[currentLang] || translations.en;
    return (key: TranslationKey): string => {
      return (dict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
    };
  }, [currentLang]);

  return (
    <TranslationContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        isNimiqDetected,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
