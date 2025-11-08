// API Service for Property Listing Backend
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Types
export interface PropertySubmission {
  title: string;
  description: string;
  location: string;
  price: number;
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
  payment_url: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// Base API configuration
const BASE_URL = 'https://property-listing-service.onrender.com/api/v1/properties';

// Auth token management
const getAuthToken = (): string | null => {
  // Try multiple possible token storage locations
  return localStorage.getItem('authToken') || 
         localStorage.getItem('access_token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('access_token');
};

// Generic API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const url = `${BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(` API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
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
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        // Clear invalid tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('access_token');
        
        toast.error('Session expired. Please log in again.');
        setTimeout(() => window.location.href = '/login', 2000);
      }
      throw error;
    }
    
    throw new Error('Network error occurred. Please check your connection.');
  }
};

// Image upload utility
const uploadImages = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];
  
  // For now, we'll handle image uploads client-side and pass URLs
  // In production, you'd upload to a CDN/service and get back URLs
  console.log(' Image upload simulation - files:', files.map(f => f.name));
  
  // Simulate image upload - return placeholder URLs
  return files.map((file, index) => 
    URL.createObjectURL(file)
    // In production: await uploadToCDN(file) and return actual CDN URLs
  );
};

// Property API methods
export const propertyService = {
  // Submit a new property
  async submitProperty(propertyData: PropertySubmission): Promise<PropertyResponse> {
    // Upload images first (in real app, upload to CDN)
    const photoUrls = await uploadImages(propertyData.photos);
    
    const payload = {
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.location,
      price: parseFloat(propertyData.price.toString()),
      amenities: propertyData.amenities,
      photos: photoUrls,
      ...(propertyData.bedrooms && { bedrooms: parseInt(propertyData.bedrooms.toString()) }),
      ...(propertyData.bathrooms && { bathrooms: parseInt(propertyData.bathrooms.toString()) }),
      ...(propertyData.area && { area: parseInt(propertyData.area.toString()) }),
    };

    return apiRequest<PropertyResponse>('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  // Get all properties (public endpoint)
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
    
    return apiRequest<Property[]>(endpoint, {
      method: 'GET',
    });
  },

  // Get specific property by ID
  async getPropertyById(id: string): Promise<Property> {
    return apiRequest<Property>(`/${id}`, {
      method: 'GET',
    });
  },

  // Get user's properties (requires authentication)
  async getUserProperties(): Promise<Property[]> {
    // Note: This endpoint might need to be implemented in your backend
    // For now, we'll filter from all properties based on ownership
    const allProperties = await this.getProperties();
    
    // In a real app, the backend would filter by owner
    // This is a temporary implementation
    return allProperties.filter(property => 
      property.status === 'APPROVED' || property.status === 'PENDING'
    );
  },

  // Get metrics (public endpoint)
  async getMetrics(): Promise<{
    total_listings: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return apiRequest('/metrics', {
      method: 'GET',
    });
  },
};

// Utility function to check authentication status
export const checkAuthStatus = (): boolean => {
  const token = getAuthToken();
  if (!token) {
    console.log(' No auth token found');
    return false;
  }
  
  // Basic token validation (you could add JWT expiration check here)
  console.log(' Auth token found');
  return true;
};

// Hook for API status and error handling
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(
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
      
      toast.error(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
