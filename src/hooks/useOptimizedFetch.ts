import { useState, useEffect, useCallback, useRef } from 'react';
// Import only what we need from @tanstack/query-core to avoid unused imports
import type { QueryClient } from '@tanstack/query-core';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  maxAge: number;
}

interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  cacheTime?: number; // in milliseconds
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// In-memory cache with proper typing
const cache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

// Initialize QueryClient only if needed
let _queryClient: QueryClient | null = null;

// Lazy initialization of QueryClient
const getQueryClient = (): QueryClient => {
  if (!_queryClient) {
    _queryClient = new QueryClient();
  }
  return _queryClient;
};

export function useOptimizedFetch<T = unknown>(
  url: string, 
  options: RequestOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);
  const { 
    method = 'GET', 
    headers = {}, 
    body, 
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache time
    retryCount = 2, 
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const executeRequest = useCallback(async (): Promise<T> => {
    // Check cache first
    const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;
    const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;
    
    if (cached && Date.now() - cached.timestamp < cached.maxAge) {
      return cached.data;
    }

    // Check for pending requests
    const pendingRequest = pendingRequests.get(cacheKey) as Promise<T> | undefined;
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create new request
    const request = (async (): Promise<T> => {
      setLoading(true);
      
      // Set up abort controller for request cancellation
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      
      let attempts = 0;
      const maxAttempts = Math.max(1, retryCount);
      
      while (attempts < maxAttempts) {
        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controllerRef.current.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const responseData = (await response.json()) as T;
          
          // Cache the successful response
          cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
            maxAge: cacheTime
          });
          
          return responseData;
          
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw err instanceof Error ? err : new Error('Request failed');
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
      
      throw new Error('Max retry attempts reached');
      
    })();
    
    // Store the promise for deduplication
    pendingRequests.set(cacheKey, request);
    
    try {
      const result = await request;
      return result as T;
    } finally {
      // Clean up
      pendingRequests.delete(cacheKey);
      setLoading(false);
    }
    
  }, [url, method, headers, body, cacheTime, retryCount, retryDelay]);

  // Cleanup function to abort pending requests
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  // Function to manually trigger a refetch
  const refetch = useCallback(async (): Promise<T | null> => {
    try {
      const result = await executeRequest();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      onError?.(error);
      return null;
    }
  }, [executeRequest, onSuccess, onError]);

  // Function to clear the cache for a specific URL or all URLs
  const clearCache = useCallback((specificUrl?: string) => {
    if (specificUrl) {
      for (const [key] of cache.entries()) {
        if (key.startsWith(specificUrl)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  }, []);

  return {
    data,
    error,
    loading,
    refetch,
    clearCache,
  };
}

// Higher-order function to create a memoized version of fetchData
export function createMemoizedFetcher() {
  const cache = new Map<string, Promise<any>>();
  
  return async function memoizedFetch<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as Promise<T>;
    }
    
    const promise = fetch(url, options).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
    
    cache.set(cacheKey, promise);
    return promise;
  };
}
