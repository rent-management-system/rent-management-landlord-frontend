import { i18n as I18n } from 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        [key: string]: string | { [key: string]: any };
      };
    };
  }
}

// This is a workaround to make TypeScript treat the i18n.js file as a module
declare module 'i18next' {
  const i18n: I18n;
  export default i18n;
}

// This is needed for the actual i18n instance
declare const i18n: I18n;
export default i18n;
