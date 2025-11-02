import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache for all loaded translations
const translationsCache: Partial<Record<Language, Record<string, string>>> = {};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('pantryPalLanguage') as Language;
      return savedLanguage || 'en';
    } catch {
      return 'en';
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('pantryPalLanguage', lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    const loadTranslations = async () => {
      // Show loader only if the specific language isn't cached yet.
      if (!translationsCache[language]) {
        setIsLoaded(false);
      }
      
      try {
        // Always ensure English is loaded for fallback
        if (!translationsCache['en']) {
            const enRes = await fetch('/locales/en.json');
            if (!enRes.ok) throw new Error('Failed to load English translations.');
            translationsCache['en'] = await enRes.json();
        }
        // Load current language if not already cached
        if (language !== 'en' && !translationsCache[language]) {
            const res = await fetch(`/locales/${language}.json`);
            if (!res.ok) throw new Error(`Failed to load ${language} translations.`);
            translationsCache[language] = await res.json();
        }
      } catch (error) {
          console.error(error);
          // If loading fails, we'll rely on the fallback.
      } finally {
        setIsLoaded(true);
      }
    };

    loadTranslations();
  }, [language]);

  const t = (key: string): string => {
    const currentLangTranslations = translationsCache[language];
    if (currentLangTranslations && currentLangTranslations[key]) {
      return currentLangTranslations[key];
    }
    
    // Fallback to English
    const fallbackTranslations = translationsCache['en'];
    if (fallbackTranslations && fallbackTranslations[key]) {
        return fallbackTranslations[key];
    }

    // If no translation is found anywhere, return the key itself.
    return key;
  };

  if (!isLoaded || !translationsCache[language]) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(to bottom right, #FEF3C7, #FFE4E6)', fontFamily: 'Nunito, sans-serif' }}>
            <svg style={{ animation: 'spin 1s linear infinite' }} height="50" width="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#E11D48" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="#E11D48" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                <style>{"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"}</style>
            </svg>
        </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};