// Global type definitions for the application

// Property statistics interface
export interface PropertyStats {
  total_listings: number;
  pending: number;
  approved: number;
  rejected: number;
  [key: string]: number; // For dynamic property access
}

// Extend Window interface
declare global {
  interface Window {
    __WB_MANIFEST: string[];
    skipWaiting(): void;
    location: {
      href: string;
      assign(url: string): void;
    };
  }

  interface Document {
    body: {
      style: {
        overflow: string;
      };
    };
  }

  interface HTMLSelectElement {
    value: string;
    selectedIndex: number;
    options: HTMLOptionsCollection;
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
