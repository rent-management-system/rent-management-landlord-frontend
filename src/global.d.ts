/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

// Extend the service worker global scope with additional types
declare const self: ServiceWorkerGlobalScope;

// Extend the global scope with our custom types
interface Window {
  __WB_MANIFEST: string[];
  skipWaiting(): void;
}

// Add types for service worker events
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends Event {
  readonly request: Request;
  readonly clientId: string;
  respondWith(response: Promise<Response> | Response): void;
}

// Add missing type definitions for modern JavaScript features
interface CacheStorage {
  match(request: Request | URL | string, options?: CacheQueryOptions): Promise<Response | undefined>;
  open(cacheName: string): Promise<Cache>;
  keys(): Promise<string[]>;
  delete(cacheName: string): Promise<boolean>;
}

interface Cache {
  match(request: Request | URL | string, options?: CacheQueryOptions): Promise<Response | undefined>;
  add(request: RequestInfo): Promise<void>;
  addAll(requests: RequestInfo[]): Promise<void>;
  put(request: Request | string, response: Response): Promise<void>;
  delete(request: Request | string, options?: CacheQueryOptions): Promise<boolean>;
  keys(request?: Request | string, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>>;
}

interface CacheQueryOptions {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
  cacheName?: string;
}

// Add missing type definitions for modern JavaScript features
declare const caches: CacheStorage;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_BASE_URL: string;
    // Add other environment variables here
  }
}

// Fix for TypeScript errors in useOptimizedFetch
declare const Map: {
  new <K, V>(): Map<K, V>;
  readonly prototype: Map<any, any>;
};

declare const Set: {
  new <T>(): Set<T>;
  readonly prototype: Set<any>;
};

declare const Promise: {
  new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
  readonly prototype: Promise<any>;
  all<T>(values: Iterable<T | PromiseLike<T>>): Promise<T[]>;
  race<T>(values: Iterable<T | PromiseLike<T>>): Promise<T>;
  reject<T = never>(reason?: any): Promise<T>;
  resolve<T>(value: T | PromiseLike<T>): Promise<T>;
};

declare const JSON: {
  parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
  stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
  stringify(value: any, replacer?: (number | string)[], space?: string | number): string;
};

declare const Date: DateConstructor;
declare const Math: Math;
declare const Error: ErrorConstructor;
declare const console: Console;
