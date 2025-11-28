/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Extend the service worker global scope with additional types
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends Event {
  readonly request: Request;
  readonly clientId: string;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
}
