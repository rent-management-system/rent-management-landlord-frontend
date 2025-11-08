// Test utility for API integration
import { propertyService, checkAuthStatus } from '@/services/propertyService';
import { useEffect } from 'react';

export const testApiIntegration = async () => {
  console.group(' API Integration Test');
  
  try {
    // 1. Check authentication
    const isAuthenticated = checkAuthStatus();
    console.log(' Authentication Status:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.error('❌ No authentication token found');
      return false;
    }

    // 2. Test metrics endpoint (public)
    console.log(' Testing metrics endpoint...');
    const metrics = await propertyService.getMetrics();
    console.log('✅ Metrics:', metrics);

    // 3. Test properties endpoint
    console.log(' Testing properties endpoint...');
    const properties = await propertyService.getProperties({ limit: 2 });
    console.log('✅ Properties loaded:', properties.length);

    console.log(' All API tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

// Run test on component mount for debugging
export const useApiTest = () => {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      testApiIntegration();
    }
  }, []);
};
