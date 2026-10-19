import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ENGLISH' | 'ARABIC';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang === 'ar' || urlLang === 'ARABIC') return 'ARABIC';
      if (urlLang === 'en' || urlLang === 'ENGLISH') return 'ENGLISH';
      const saved = localStorage.getItem('emsa7_language');
      return saved === 'ARABIC' ? 'ARABIC' : 'ENGLISH';
    } catch {
      return 'ENGLISH';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('emsa7_language', lang);
    } catch (e) {
      console.error('Failed to save language to localStorage', e);
    }
  };

  useEffect(() => {
    const isAr = language === 'ARABIC';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isArabic: language === 'ARABIC',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
