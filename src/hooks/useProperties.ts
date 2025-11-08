import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { propertyService, Property, PropertySubmission, PropertyResponse } from '@/services/propertyService';
import { useApi } from '@/services/propertyService';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [metrics, setMetrics] = useState<{
    total_listings: number;
    pending: number;
    approved: number;
    rejected: number;
  } | null>(null);
  
  const { execute, loading, error } = useApi();

  // Load all properties
  const loadProperties = useCallback(async (filters?: Parameters<typeof propertyService.getProperties>[0]) => {
    return execute(() => propertyService.getProperties(filters), {
      onSuccess: (data) => setProperties(data || []),
    });
  }, [execute]); // execute is a dependency

  // Load user's properties
  const loadUserProperties = useCallback(async () => {
    return execute(() => propertyService.getUserProperties(), {
      onSuccess: (data) => setUserProperties(data || []),
    });
  }, [execute]); // execute is a dependency

  // Load metrics
  const loadMetrics = useCallback(async () => {
    return execute(() => propertyService.getMetrics(), {
      onSuccess: (data) => setMetrics(data),
    });
  }, [execute]); // execute is a dependency

  // Submit new property
  const submitProperty = useCallback(async (propertyData: PropertySubmission): Promise<PropertyResponse | null> => {
    return execute(() => propertyService.submitProperty(propertyData), {
      successMessage: 'Property submitted successfully! Redirecting to payment...',
      onSuccess: (response) => {
        if (response?.payment_url) {
          // Redirect to payment URL
          window.location.href = response.payment_url;
        }
        // Reload user properties to show the new submission
        loadUserProperties();
      },
    });
  }, [execute, loadUserProperties]); // execute and loadUserProperties are dependencies

  // Initialize data
  useEffect(() => {
    loadProperties();
    loadUserProperties();
    loadMetrics();
  }, [loadProperties, loadUserProperties, loadMetrics]);

  return {
    properties,
    userProperties,
    metrics,
    loading,
    error,
    actions: {
      loadProperties,
      loadUserProperties,
      submitProperty,
    },
  };
};
