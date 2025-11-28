// Global type definitions for the application
import { ReactI18NextChildren } from 'react-i18next';

// Property statistics interface
export interface PropertyStats {
  total_listings: number;
  pending: number;
  approved: number;
  rejected: number;
  [key: string]: number; // For dynamic property access
}

declare global {
  // Extend Window interface
  interface Window {
    __WB_MANIFEST: string[];
    skipWaiting(): void;
    matchMedia(query: string): MediaQueryList;
    innerWidth: number;
    location: {
      href: string;
      assign(url: string): void;
    };
  }

  // Extend Document interface
  interface Document {
    cookie: string;
    getElementById(elementId: string): HTMLElement | null;
    body: {
      style: {
        overflow: string;
      };
    };
  }

  // Extend HTML elements
  interface HTMLInputElement {
    name: string;
    value: string;
    files: FileList | null;
  }

  interface HTMLTextAreaElement {
    name: string;
    value: string;
  }

  interface HTMLTableCellElement extends HTMLElement {}
  interface HTMLTableCaptionElement extends HTMLElement {}

  // Extend Event interfaces
  interface KeyboardEvent {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
  }

  interface EventTarget {
    name?: string;
    value?: string;
    files?: FileList;
  }

  interface HTMLSelectElement extends HTMLElement {
    selectedIndex: number;
    options: HTMLOptionsCollection;
    value: string;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  }

  // Basic type definitions
  type Nullable<T> = T | null;
  type Optional<T> = T | undefined;
  type Dictionary<T> = Record<string, T>;
  type StringMap = Dictionary<string>;
  type NumberMap = Dictionary<number>;
  type BooleanMap = Dictionary<boolean>;

  // Utility types for React setState
  type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
  type StateTuple<T> = [T, SetState<T>];

  // Re-export PropertyStats to global scope
  type PropertyStats = globalThis.PropertyStats;
}

// Make TypeScript treat this as a module
export {};
