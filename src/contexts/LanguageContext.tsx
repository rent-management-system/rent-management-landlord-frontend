import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Language = 'en' | 'am' | 'om';

type Translations = {
  [key: string]: string;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<Record<Language, Translations>>({
    en: {},
    am: {},
    om: {}
  });

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [en, am, om] = await Promise.all([
          import('../../public/locales/en/translation.json'),
          import('../../public/locales/am/translation.json'),
          import('../../public/locales/om/translation.json')
        ]);
        
        setTranslations({
          en: en.default || en,
          am: am.default || am,
          om: om.default || om
        });
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
