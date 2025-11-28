import { useState, useEffect, useCallback } from 'react';
import { propertyService, Property, PropertySubmission, PropertyResponse, UpdatePropertyPayload, ApproveAndPayResponse } from '@/services/propertyService';
import { useApi } from '@/services/propertyService';
import type { PropertyStats } from '@/types/global';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [metrics, setMetrics] = useState<PropertyStats | null>(null);
  const [reservedProperties, setReservedProperties] = useState<{total: number, items: Property[]}>({total: 0, items: []});
  
  const { execute, loading, error } = useApi();

  // Load all properties with error handling
  const loadProperties = useCallback(async (filters?: Record<string, any>) => {
    return execute(() => propertyService.getProperties(filters), {
      onSuccess: (data) => {
        if (data) setProperties(data);
      },
      onError: (error) => {
        console.warn('Failed to load properties:', error);
        // Set empty array instead of showing error for CORS issues
        setProperties([]);
      },
    });
  }, [execute]);

  // Load user's properties with error handling
  const loadUserProperties = useCallback(async () => {
    return execute(() => propertyService.getUserProperties(), {
      onSuccess: (data) => {
        if (data) setUserProperties(data);
      },
      onError: (error) => {
        console.warn('Failed to load user properties:', error);
        // Set empty array for CORS issues
        setUserProperties([]);
      },
    });
  }, [execute]);

  // Load metrics with error handling
  const loadMetrics = useCallback(async () => {
    return execute(() => propertyService.getMetrics(), {
      onSuccess: (data) => {
        if (data) setMetrics(data);
      },
      onError: (error) => {
        console.warn('Failed to load metrics:', error);
        // Set default metrics for CORS issues
        setMetrics({
          total_listings: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        });
      },
    });
  }, [execute]);

  // Submit new property
  const submitProperty = useCallback(async (propertyData: PropertySubmission): Promise<PropertyResponse | null> => {
    return execute(() => propertyService.submitProperty(propertyData), {
      successMessage: 'Property submitted successfully! Redirecting to payment...',
      onSuccess: () => {
        loadUserProperties();
      },
    });
  }, [execute, loadUserProperties]);

  // Approve a property
  const approveProperty = useCallback(async (id: string) => {
    return execute(() => propertyService.approveProperty(id), {
      successMessage: 'Property approved successfully',
      onSuccess: () => {
        loadUserProperties();
        loadMetrics();
      },
    });
  }, [execute, loadUserProperties, loadMetrics]);

  // Delete a property
  const deleteProperty = useCallback(async (id: string) => {
    return execute(() => propertyService.deleteProperty(id), {
      successMessage: 'Property deleted successfully',
      onSuccess: () => {
        loadUserProperties();
        loadMetrics();
      },
    });
  }, [execute, loadUserProperties, loadMetrics]);

  // Reserve/Unreserve a property
  const reserveProperty = useCallback(async (id: string, reserved: boolean) => {
    return execute(() => propertyService.reserveProperty(id, reserved), {
      successMessage: reserved ? 'Property marked as reserved' : 'Reservation removed',
      onSuccess: (updated) => {
        // Optimistic local update for instant UI feedback
        setUserProperties(prev => prev.map(p => p.id === id ? { ...p, reserved: (updated?.reserved ?? reserved) } : p));
        // Ensure server truth is reflected
        loadUserProperties();
      },
    });
  }, [execute, loadUserProperties]);

  // Update an existing property
  const updateProperty = useCallback(async (id: string, data: UpdatePropertyPayload) => {
    return execute(() => propertyService.updateProperty(id, data), {
      successMessage: 'Property updated successfully',
      onSuccess: () => {
        loadUserProperties();
      },
    });
  }, [execute, loadUserProperties]);

  // Approve and pay for a pending property
  const approveAndPay = useCallback(async (id: string): Promise<ApproveAndPayResponse | null> => {
    return execute(() => propertyService.approveAndPay(id), {
      // don't show success toast here since we'll redirect to checkout
      onSuccess: () => {
        // no-op; UI layer will handle redirect
      },
    });
  }, [execute]);

  // Load reserved properties
  const loadReservedProperties = useCallback(async () => {
    return execute(() => propertyService.getReservedProperties(), {
      onSuccess: (data) => {
        if (data) setReservedProperties(data);
      },
      onError: (error) => {
        console.warn('Failed to load reserved properties:', error);
        setReservedProperties({total: 0, items: []});
      },
    });
  }, [execute]);

  // Initialize data
  useEffect(() => {
    loadProperties();
    loadUserProperties();
    loadMetrics();
    loadReservedProperties();
  }, [loadProperties, loadUserProperties, loadMetrics, loadReservedProperties]);

  return {
    properties,
    userProperties,
    metrics,
    reservedProperties,
    loading,
    error,
    actions: {
      loadProperties,
      loadUserProperties,
      submitProperty,
      approveProperty,
      deleteProperty,
      reserveProperty,
      updateProperty,
      approveAndPay,
    },
  };
};