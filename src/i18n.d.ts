// Type declarations for i18n.js
declare module '*/i18n.js' {
  interface I18nInstance {
    // Add specific methods and properties used from i18n
    t: (key: string, options?: Record<string, any>) => string;
    changeLanguage: (lng: string) => Promise<any>;
    language: string;
    // Add other i18n methods as needed
  }

  const i18n: I18nInstance;
  export default i18n;
}
