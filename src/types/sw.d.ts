// Type definitions for service worker
/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Extend the service worker global scope with additional types
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends Event {
  readonly request: Request;
  readonly clientId: string;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
}

declare global {
  // Add global types that are missing from the default lib
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

  // Add missing global variables
  const caches: CacheStorage;
  const clients: Clients;
  const registration: ServiceWorkerRegistration;
}

export {};
