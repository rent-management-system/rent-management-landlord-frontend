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

  interface UseTranslationResponse {
    t: (key: string, options?: any) => string;
    i18n: I18n;
  }

  export function useTranslation(): UseTranslationResponse;
}
