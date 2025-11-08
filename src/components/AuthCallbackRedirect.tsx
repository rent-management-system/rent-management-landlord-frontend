import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { debugAuth } from '@/utils/debug';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const AuthCallbackRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing authentication...');

  useEffect(() => {
    const processToken = async () => {
      debugAuth.log('AuthCallbackRedirect: Starting token processing');
      
      const token = searchParams.get('token');
      debugAuth.log('AuthCallbackRedirect: Token from URL', { 
        hasToken: !!token,
        tokenLength: token?.length 
      });

      if (!token) {
        setStatus('error');
        setMessage('No authentication token found in URL');
        setTimeout(() => {
          window.location.href = '/login?error=no_token';
        }, 3000);
        return;
      }

      try {
        setStatus('processing');
        setMessage('Verifying token...');

        // Step 1: Store token temporarily
        sessionStorage.setItem('access_token', token);
        debugAuth.log('✅ Token stored in sessionStorage');

        // Step 2: Verify token with backend - FIXED VERSION
        debugAuth.log(' Calling verify endpoint...');
        
        const verifyResponse = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Remove Content-Type for GET requests to avoid CORS preflight
          },
          // Add credentials mode for CORS
          credentials: 'omit', // or 'same-origin' depending on CORS config
        });

        debugAuth.log('Verify response status:', verifyResponse.status);
        debugAuth.log('Verify response ok:', verifyResponse.ok);

        if (!verifyResponse.ok) {
          const errorText = await verifyResponse.text();
          debugAuth.log('❌ Token verification failed', {
            status: verifyResponse.status,
            statusText: verifyResponse.statusText,
            error: errorText
          });
          
          // More specific error handling
          if (verifyResponse.status === 401) {
            throw new Error('Token is invalid or expired');
          } else if (verifyResponse.status === 403) {
            throw new Error('Access forbidden');
          } else {
            throw new Error(`Server error: ${verifyResponse.status} ${verifyResponse.statusText}`);
          }
        }

        const userData = await verifyResponse.json();
        debugAuth.log('✅ Token verified successfully', userData);

        // Step 3: Store complete user data
        const user = {
          id: userData.user_id,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name || 'Property Owner',
          phone_number: userData.phone_number,
          preferred_language: userData.preferred_language || 'en',
          preferred_currency: userData.preferred_currency || 'ETB'
        };

        sessionStorage.setItem('user_data', JSON.stringify(user));
        debugAuth.log('✅ User data stored', user);

        // Step 4: Refresh auth context
        setMessage('Setting up your session...');
        await refreshAuth();

        // Step 5: Clean URL and redirect
        if (window.history.replaceState) {
          const cleanUrl = window.location.origin + '/';
          window.history.replaceState({}, document.title, cleanUrl);
          debugAuth.log('✅ URL cleaned:', cleanUrl);
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');
        
        debugAuth.log('✅ Redirecting to main application');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (error) {
        console.error('AuthCallbackRedirect error:', error);
        debugAuth.log('❌ Authentication failed', { error: error.message });
        
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);
        
        // Clean up on error
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_data');
        
        setTimeout(() => {
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
        }, 5000);
      }
    };

    processToken();
  }, [searchParams, refreshAuth]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h2 className="text-2xl font-bold mb-4">
          {status === 'processing' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-lg mb-6">{message}</p>

        {status === 'processing' && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Verifying your credentials with authentication service...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              Please try logging in again. If the problem continues, contact support.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackRedirect;