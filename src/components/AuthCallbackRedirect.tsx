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
      debugAuth.log(' AuthCallbackRedirect: Starting token processing');
      
      // Get token from URL
      const token = searchParams.get('token');
      debugAuth.log(' Token from URL', { 
        hasToken: !!token,
        tokenLength: token?.length,
        fullUrl: window.location.href
      });

      if (!token) {
        debugAuth.log('❌ No token found in URL');
        setStatus('error');
        setMessage('No authentication token found. Please try logging in again.');
        setTimeout(() => {
          window.location.href = '/login?error=no_token';
        }, 3000);
        return;
      }

      try {
        setStatus('processing');
        setMessage('Verifying token...');

        // Step 1: Store token immediately
        sessionStorage.setItem('access_token', token);
        localStorage.setItem('access_token', token); // Backup in localStorage
        debugAuth.log('✅ Token stored in sessionStorage & localStorage');

        // Step 2: Verify token with backend - SIMPLIFIED FETCH
        debugAuth.log(' Calling verify endpoint...');
        
        const verifyResponse = await fetch(
          'https://rent-managment-system-user-magt.onrender.com/api/v1/auth/verify', 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              // NO Content-Type header for GET requests
            },
            credentials: 'omit', // Important for CORS
          }
        );

        debugAuth.log(' Verify response received', {
          status: verifyResponse.status,
          ok: verifyResponse.ok,
          headers: Object.fromEntries(verifyResponse.headers.entries())
        });

        if (!verifyResponse.ok) {
          let errorData;
          try {
            errorData = await verifyResponse.text();
          } catch {
            errorData = 'Could not read error response';
          }
          
          debugAuth.log('❌ Token verification failed', {
            status: verifyResponse.status,
            statusText: verifyResponse.statusText,
            error: errorData
          });
          
          throw new Error(`Verification failed: ${verifyResponse.status} ${verifyResponse.statusText}`);
        }

        const userData = await verifyResponse.json();
        debugAuth.log('✅ Token verified successfully', userData);

        // Step 3: Store complete user data
        const user = {
          id: userData.user_id,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name || userData.email?.split('@')[0] || 'User',
          phone_number: userData.phone_number,
          preferred_language: userData.preferred_language || 'en',
          preferred_currency: userData.preferred_currency || 'ETB',
          // Add any other fields your app expects
        };

        sessionStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem('user_data', JSON.stringify(user)); // Backup
        debugAuth.log('✅ User data stored', user);

        // Step 4: Refresh auth context
        setMessage('Setting up your session...');
        await refreshAuth();

        // Step 5: Clean URL and redirect
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        debugAuth.log('✅ Cleaning URL and redirecting...');
        
        // Remove token from URL without reload
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);

      } catch (error) {
        console.error(' AuthCallbackRedirect error:', error);
        debugAuth.log('❌ Authentication process failed', { 
          error: error.message,
          stack: error.stack 
        });
        
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);
        
        // Clean up on error
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_data');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        
        setTimeout(() => {
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
        }, 4000);
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
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'processing' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-lg text-gray-600 mb-6">{message}</p>

        {status === 'processing' && (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">
              Securely verifying your credentials...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              Please try logging in again. If the problem continues, contact support.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
            >
              Retry Authentication
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Redirecting you to the application...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackRedirect;