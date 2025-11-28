import { ReactNode } from 'react';

declare module 'i18next' {
  interface TFunction {
    (key: string, options?: any): string;
  }

  interface i18n {
    t: TFunction;
    language: string;
    changeLanguage(lng: string): Promise<TFunction>;
  }
}

declare module 'react-i18next' {
  import { i18n as I18n } from 'i18next';
  import { ReactNode } from 'react';

  interface UseTranslationResponse {
    t: (key: string, options?: any) => string;
    i18n: I18n;
    ready: boolean;
  }

  interface I18nextProviderProps {
    i18n: I18n;
    defaultNS?: string;
    children: ReactNode;
  }

  export const I18nextProvider: React.FC<I18nextProviderProps>;
  export function useTranslation(ns?: string, options?: any): UseTranslationResponse;
  export function initReactI18next(instance: I18n): void;
  export const withTranslation: any;
  export const Trans: any;
  export const useSSR: any;
  export const withSSR: any;
  export const I18nContext: React.Context<{ i18n: I18n }>;
}
