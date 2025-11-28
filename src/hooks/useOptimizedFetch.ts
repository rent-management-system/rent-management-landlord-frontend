import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  maxAge: number;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: BodyInit | null;
  cacheTime?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface RequestOptions<T> extends Omit<FetchOptions, 'body'> {
  body?: unknown;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// In-memory cache with proper typing
const cache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

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
    headers = { 'Content-Type': 'application/json' },
    body,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache time
    retryCount = 2,
    retryDelay = 1000,
    onSuccess,
    onError: onErrorCallback,
    ...fetchOptions
  } = options;

  const executeRequest = useCallback(async (): Promise<T> => {
    // Check cache first
    const cacheKey = `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
    const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;
    
    // Create request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...fetchOptions
    };
    
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }
    
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
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onErrorCallback) {
        onErrorCallback(error);
      }
      return null;
    }
  }, [executeRequest, onSuccess, onErrorCallback]);

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
