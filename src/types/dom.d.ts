// Type definitions for browser globals
declare const document: Document;
declare const window: Window & typeof globalThis;
declare const navigator: Navigator;

// Add type definitions for the Web Worker context
declare const self: Window & typeof globalThis;

// Add type definitions for the Service Worker context
interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: string[];
  skipWaiting(): void;
}

declare const self: ServiceWorkerGlobalScope;

// Extend the Window interface to include any custom properties
interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  __INITIAL_STATE__?: any;
}
