// API Service for Property Listing Backend - CORS FIXED VERSION
import { toast } from 'sonner';
import { useState, useCallback } from 'react'; // Added useState for useApi hook

// Types (keep your existing types)
export interface PropertySubmission {
  title: string;
  description: string;
  location: string;
  price: number;
  house_type: string; // Added house_type
  amenities: string[];
  photos: File[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  amenities: string[];
  photos: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  house_type?: string;
  payment_status?: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  approval_timestamp?: string | null;
  lat?: number;
  lon?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  views?: number;
  rating?: number;
  reviewCount?: number;
  reserved?: boolean;
}

export interface PropertyResponse {
  property_id: string;
  status: 'PENDING';
  payment_id: string;
  chapa_tx_ref: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// Payload for updating a property
export interface UpdatePropertyPayload {
  title?: string;
  description?: string;
  price?: number;
  amenities?: string[];
}

// Payment initiation response for approve-and-pay
export interface ApproveAndPayResponse {
  property_id: string;
  status: string;
  payment_id: string;
  chapa_tx_ref: string;
  checkout_url: string;
}

// Base API configuration (env-configurable)
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://property-listing-service.onrender.com/api/v1/properties';

// Auth token management
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('access_token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('access_token');
};

// Helper: extract reserved boolean from various possible backend representations
const extractReserved = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;

  // Direct boolean flags
  if (typeof obj.reserved === 'boolean') return obj.reserved;
  if (typeof obj.is_reserved === 'boolean') return obj.is_reserved;
  if (typeof obj.isReserved === 'boolean') return obj.isReserved;

  // String flags
  if (typeof obj.reserved === 'string') return obj.reserved.toLowerCase() === 'true' || obj.reserved.toLowerCase() === 'yes';
  if (typeof obj.is_reserved === 'string') return obj.is_reserved.toLowerCase() === 'true' || obj.is_reserved.toLowerCase() === 'yes';

  // Reservation objects
  const reservation = obj.reservation || obj.booking || obj.reserve;
  if (reservation && typeof reservation === 'object') {
    if (typeof reservation.active === 'boolean') return reservation.active;
    if (typeof reservation.status === 'string') return ['active', 'reserved', 'true', 'yes'].includes(reservation.status.toLowerCase());
    if (reservation.user || reservation.by || reservation.by_user) return true; // any reservation record implies reserved
  }

  return false;
};

// Helper: safely extract numeric area from various possible backend keys (supports shallow and common nested fields)
const extractArea = (obj: any): number | undefined => {
  if (!obj || typeof obj !== 'object') return undefined;

  const tryParse = (v: any): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const n = typeof v === 'string' ? parseFloat(v) : Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  // Known direct keys
  const directCandidates = [
    obj.area,
    obj.area_m2,
    obj.area_m,
    obj.area_in_m2,
    obj.square_meters,
    obj.squareMeters,
    obj.floor_area,
    obj.gross_area,
    obj.net_area,
    obj.size,
    obj.sqm,
  ];
  for (const v of directCandidates) {
    const parsed = tryParse(v);
    if (parsed !== undefined) return parsed;
  }

  // Common nested containers
  const nested = obj.details || obj.meta || obj.attributes || obj.property || obj.specs;
  if (nested && typeof nested === 'object') {
    const nestedCandidates = [
      nested.area,
      nested.area_m2,
      nested.area_m,
      nested.area_in_m2,
      nested.square_meters,
      nested.squareMeters,
      nested.floor_area,
      nested.gross_area,
      nested.net_area,
      nested.size,
      nested.sqm,
    ];
    for (const v of nestedCandidates) {
      const parsed = tryParse(v);
      if (parsed !== undefined) return parsed;
    }

    // Fuzzy key search within nested object
    for (const [k, v] of Object.entries(nested)) {
      if (/(^|_)(area|sqm|square|floor_area)(_|$)/i.test(k)) {
        const parsed = tryParse(v as any);
        if (parsed !== undefined) return parsed;
      }
    }
  }

  // Fuzzy key search at root level
  for (const [k, v] of Object.entries(obj)) {
    if (/(^|_)(area|sqm|square|floor_area)(_|$)/i.test(k)) {
      const parsed = tryParse(v as any);
      if (parsed !== undefined) return parsed;
    }
  }

  return undefined;
};

// Decode JWT payload safely without external deps
const decodeJwtPayload = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

// Check if token is expired using `exp` claim (seconds)
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false; // if no exp, assume not expired
  const nowInSeconds = Math.floor(Date.now() / 1000);
  // Add a small skew (30s) to avoid edge cases
  return payload.exp <= (nowInSeconds + 30);
};

// CORS-FIXED API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  // Proactive expiry check for protected, non-GET requests
  const method = (options.method || 'GET').toUpperCase();
  const isProtectedWrite = method !== 'GET';
  if (isProtectedWrite && isTokenExpired(token)) {
    // Clear stale tokens and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('access_token');
    toast.error('Session expired. Please log in again.');
    setTimeout(() => (window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/'), 1500);
    throw new Error('Authentication failed. Please log in again.');
  }
  
  const url = `${BASE_URL}${endpoint}`;
  
  // CORS FIX: Use mode: 'cors' and proper headers
  // IMPORTANT: Merge options first, then compose headers so Authorization isn't lost
  const config: RequestInit = {
    mode: 'cors', // Explicitly enable CORS
    credentials: 'omit', // Don't send cookies
    ...options,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as any),
    },
  };

  // CORS FIX: For GET requests, avoid Content-Type to prevent preflight
  if (options.method === 'GET' || !options.method) {
    // Remove Content-Type for GET requests
    if (config.headers && 'Content-Type' in config.headers) {
      delete (config.headers as any)['Content-Type'];
    }
  }

  try {
    console.log(` API Request: ${options.method || 'GET'} ${url}`);
    console.log(` Auth Token: ${token ? 'Present' : 'Missing'}`);
    
    const response = await fetch(url, config);
    
    console.log(` Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      let errorDetails: any = null; // To store parsed error details
      try {
        errorDetails = await response.json();
        if (response.status === 422 && Array.isArray(errorDetails.detail)) {
          // Handle FastAPI validation errors
          errorMessage = errorDetails.detail
            .map((err: any) => {
              const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'Request';
              // Capitalize first letter of field
              const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
              return `${formattedField}: ${err.msg}`;
            })
            .join('; ');
        } else {
          errorMessage = errorDetails.detail || errorDetails.message || errorMessage;
        }
      } catch (jsonError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Log full error details if available
      if (errorDetails) {
        console.error('❌ API Error Details:', errorDetails);
      }

      // Specific error handling for CORS and auth
      if (response.status === 0) {
        errorMessage = 'CORS Error: Unable to connect to the server. Check if the backend allows requests from your domain.';
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('access_token');
        setTimeout(() => (window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/'), 1500);
      }
      
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API Request Failed:', error);
    
    // Handle CORS and network errors specifically
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server. This may be a CORS issue. Please check the backend CORS configuration.');
      }
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => window.location.href = 'https://rental-user-management-frontend-sigma.vercel.app/', 2000);
      }
      throw error;
    }
    
    throw new Error('Network error occurred. Please check your connection.');
  }
};

// Property API methods - CORS OPTIMIZED
export const propertyService = {
  // Submit a new property
  async submitProperty(propertyData: PropertySubmission): Promise<PropertyResponse> {
    const formData = new FormData();

    // Append text fields
    formData.append('title', propertyData.title);
    formData.append('description', propertyData.description);
    formData.append('location', propertyData.location);
    formData.append('price', propertyData.price.toString());
    formData.append('house_type', propertyData.house_type);

    // Append amenities array
    propertyData.amenities.forEach(amenity => {
      formData.append('amenities', amenity);
    });

    // Append optional fields if they exist
    if (propertyData.bedrooms) {
      formData.append('bedrooms', propertyData.bedrooms.toString());
    }
    if (propertyData.bathrooms) {
      formData.append('bathrooms', propertyData.bathrooms.toString());
    }
    if (propertyData.area) {
      formData.append('area', propertyData.area.toString());
    }

    // Append the first photo file if available
    if (propertyData.photos && propertyData.photos.length > 0) {
      formData.append('file', propertyData.photos[0], propertyData.photos[0].name);
    }

    console.log('FormData being sent to the backend:', formData);

    return apiRequest<PropertyResponse>('/submit', {
      method: 'POST',
      // DO NOT set Content-Type header. The browser does it automatically for FormData.
      body: formData,
    });
  },

  // Get all properties (public endpoint) - CORS FIXED
  async getProperties(params?: {
    location?: string;
    min_price?: number;
    max_price?: number;
    amenities?: string[];
    search?: string;
    offset?: number;
    limit?: number;
  }): Promise<Property[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/?${queryString}` : '/';
    
    // CORS FIX: No Content-Type header for GET requests
    const data = await apiRequest<any[]>(endpoint, {
      method: 'GET',
      // No headers for GET to avoid preflight
    });

    // Normalize list payload
    const normalized: Property[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.location,
      price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price ?? 0),
      amenities: Array.isArray(item.amenities) ? item.amenities : [],
      photos: Array.isArray(item.photos) ? item.photos : [],
      status: item.status,
      house_type: item.house_type,
      payment_status: item.payment_status,
      approval_timestamp: item.approval_timestamp ?? null,
      lat: typeof item.lat === 'number' ? item.lat : undefined,
      lon: typeof item.lon === 'number' ? item.lon : undefined,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      area: extractArea(item),
      views: item.views,
      rating: item.rating,
      reviewCount: item.reviewCount,
      reserved: extractReserved(item),
    }));

    return normalized;
  },

  // Get specific property by ID
  async getPropertyById(id: string): Promise<Property> {
    const item = await apiRequest<any>(`/${id}`, {
      method: 'GET',
      // No headers for GET to avoid preflight
    });

    // Normalize server payload
    const normalized: Property = {
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.location,
      price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price ?? 0),
      amenities: Array.isArray(item.amenities) ? item.amenities : [],
      photos: Array.isArray(item.photos) ? item.photos : [],
      status: item.status,
      house_type: item.house_type,
      payment_status: item.payment_status,
      approval_timestamp: item.approval_timestamp ?? null,
      lat: typeof item.lat === 'number' ? item.lat : undefined,
      lon: typeof item.lon === 'number' ? item.lon : undefined,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      area: extractArea(item),
      views: item.views,
      rating: item.rating,
      reviewCount: item.reviewCount,
      reserved: extractReserved(item),
    };

    return normalized;
  },

  // Get user's properties
  async getUserProperties(): Promise<Property[]> {
    try {
      // Fetch from dedicated backend endpoint that returns only the authenticated user's properties
      const data = await apiRequest<any[]>('/my-properties', {
        method: 'GET',
      });

      // Normalize backend response to our Property shape
      const normalized: Property[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        location: item.location,
        price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price ?? 0),
        amenities: Array.isArray(item.amenities) ? item.amenities : [],
        photos: Array.isArray(item.photos) ? item.photos : [],
        status: item.status,
        house_type: item.house_type,
        payment_status: item.payment_status,
        approval_timestamp: item.approval_timestamp ?? null,
        lat: typeof item.lat === 'number' ? item.lat : undefined,
        lon: typeof item.lon === 'number' ? item.lon : undefined,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: extractArea(item),
        views: item.views,
        rating: item.rating,
        reviewCount: item.reviewCount,
        reserved: extractReserved(item),
      }));

      return normalized;
    } catch (error) {
      console.error('Error getting user properties:', error);
      return [];
    }
  },

  // Get metrics (public endpoint) - CORS FIXED
  async getMetrics(): Promise<{
    total_listings: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return apiRequest('/metrics', {
      method: 'GET',
      // No headers for GET to avoid preflight
    });
  },

  // Approve and initiate payment for a PENDING property with retry logic
  async approveAndPay(id: string, retries = 3, delay = 1000): Promise<ApproveAndPayResponse> {
    const retryWithBackoff = async (attempt: number): Promise<ApproveAndPayResponse> => {
      try {
        return await apiRequest<ApproveAndPayResponse>(`/${id}/approve-and-pay/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        // If we get a 429 and have retries left, wait and retry
        if (error.status === 429 && attempt < retries) {
          const waitTime = delay * Math.pow(2, attempt - 1);
          console.warn(`Rate limited. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return retryWithBackoff(attempt + 1);
        }
        
        // If we get a 429 but no retries left, provide a more helpful error
        if (error.status === 429) {
          const retryAfter = error.response?.headers?.get('Retry-After') || 60; // Default to 60 seconds if no Retry-After header
          const errorMessage = `Payment service is currently busy. Please try again in ${retryAfter} seconds.`;
          console.error(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        // For other errors, just rethrow
        throw error;
      }
    };

    return retryWithBackoff(1);
  },

  // Approve a property (owner action)
  async approveProperty(id: string): Promise<{ success: boolean }>{
    // Using POST to /:id/approve (adjust to your backend path if different)
    return apiRequest<{ success: boolean }>(`/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approve: true }),
    });
  },

  // Delete a property (owner action) - expects 204 No Content
  async deleteProperty(id: string): Promise<void> {
    // We ignore the response body since backend returns 204
    await apiRequest<unknown>(`/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle reserved flag for a property (owner action)
  async reserveProperty(id: string, reserved: boolean = true): Promise<Property> {
    // Backend uses PATCH /:id/reserve and PATCH /:id/unreserve
    const path = reserved ? `/${id}/reserve` : `/${id}/unreserve`;
    const options: RequestInit = reserved
      ? {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reserved: true }),
        }
      : {
          method: 'PATCH',
        };

    const updated = await apiRequest<any>(path, options);

    const normalized: Property = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      location: updated.location,
      price: typeof updated.price === 'string' ? parseFloat(updated.price) : Number(updated.price ?? 0),
      amenities: Array.isArray(updated.amenities) ? updated.amenities : [],
      photos: Array.isArray(updated.photos) ? updated.photos : [],
      status: updated.status,
      house_type: updated.house_type,
      payment_status: updated.payment_status,
      approval_timestamp: updated.approval_timestamp ?? null,
      lat: typeof updated.lat === 'number' ? updated.lat : undefined,
      lon: typeof updated.lon === 'number' ? updated.lon : undefined,
      bedrooms: updated.bedrooms,
      bathrooms: updated.bathrooms,
      area: extractArea(updated),
      views: updated.views,
      rating: updated.rating,
      reviewCount: updated.reviewCount,
      reserved: extractReserved(updated),
    };

    return normalized;
  },

  // Update a property (owner action)
  async updateProperty(id: string, data: UpdatePropertyPayload): Promise<Property> {
    const updated = await apiRequest<any>(`/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const normalized: Property = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      location: updated.location,
      price: typeof updated.price === 'string' ? parseFloat(updated.price) : Number(updated.price ?? 0),
      amenities: Array.isArray(updated.amenities) ? updated.amenities : [],
      photos: Array.isArray(updated.photos) ? updated.photos : [],
      status: updated.status,
      house_type: updated.house_type,
      payment_status: updated.payment_status,
      approval_timestamp: updated.approval_timestamp ?? null,
      lat: typeof updated.lat === 'number' ? updated.lat : undefined,
      lon: typeof updated.lon === 'number' ? updated.lon : undefined,
      bedrooms: updated.bedrooms,
      bathrooms: updated.bathrooms,
      area: extractArea(updated),
      views: updated.views,
      rating: updated.rating,
      reviewCount: updated.reviewCount,
      reserved: extractReserved(updated),
    };

    return normalized;
  },
};

// Utility function to check authentication status
export const checkAuthStatus = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Hook for API status and error handling
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      successMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // Don't show toast for CORS errors to avoid spam
      if (!errorMessage.includes('CORS') && !errorMessage.includes('Network error')) {
        toast.error(errorMessage);
      }
      
      options.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
};