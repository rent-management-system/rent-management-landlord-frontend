// API Service for Property Listing Backend - CORS FIXED VERSION
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react'; // Added useState and useEffect for useApi hook

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
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  views?: number;
  rating?: number;
  reviewCount?: number;
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

// Base API configuration
const BASE_URL = 'https://property-listing-service.onrender.com/api/v1/properties';

// Auth token management
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('access_token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('access_token');
};

// CORS-FIXED API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const url = `${BASE_URL}${endpoint}`;
  
  // CORS FIX: Use mode: 'cors' and proper headers
  const config: RequestInit = {
    mode: 'cors', // Explicitly enable CORS
    credentials: 'omit', // Don't send cookies
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
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
        setTimeout(() => window.location.href = '/login', 2000);
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
    return apiRequest<Property[]>(endpoint, {
      method: 'GET',
      // No headers for GET to avoid preflight
    });
  },

  // Get specific property by ID
  async getPropertyById(id: string): Promise<Property> {
    return apiRequest<Property>(`/${id}`, {
      method: 'GET',
      // No headers for GET to avoid preflight
    });
  },

  // Get user's properties
  async getUserProperties(): Promise<Property[]> {
    try {
      const allProperties = await this.getProperties();
      // Filter to show only approved/pending properties for demo
      return allProperties.filter(property => 
        property.status === 'APPROVED' || property.status === 'PENDING'
      );
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