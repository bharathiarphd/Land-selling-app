import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import en from '../locales/en.json';
import ta from '../locales/ta.json';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = {
  en,
  ta
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('land_selling_app_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ta')) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('land_selling_app_lang', lang);
    document.documentElement.lang = lang;
    
    // Future Backend Support Placeholder:
    // if (userIsLoggedIn) {
    //   fetch('/api/settings/language', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ language: lang })
    //   });
    // }
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let value: any = dictionaries[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return keyPath; // Fallback to key if translation missing
      }
    }
    
    return typeof value === 'string' ? value : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
