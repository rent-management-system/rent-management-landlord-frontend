import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { debugAuth } from '@/utils/debug';
import { tokenHandler } from '@/utils/tokenHandler'; // Import tokenHandler
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const AuthCallbackRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing authentication...');

  useEffect(() => {
    const processAuthCallback = async () => {
      debugAuth.log('AuthCallbackRedirect: Starting authentication callback processing');
      
      const token = searchParams.get('token');

      if (!token) {
        debugAuth.log('❌ No token found in URL for AuthCallbackRedirect');
        setStatus('error');
        setMessage('No authentication token found. Please try logging in again.');
        setTimeout(() => {
          window.location.href = '/login?error=no_token';
        }, 3000);
        return;
      }

      try {
        setStatus('processing');
        setMessage('Verifying authentication token...');

        // Use tokenHandler to process the token from the URL
        // This function handles verification, storage, and URL cleaning internally
        const success = await tokenHandler.handleTokenFromURL();

        if (success) {
          debugAuth.log('✅ Token processed successfully by tokenHandler');
          setMessage('Setting up your session...');
          await refreshAuth(); // Refresh AuthContext state after tokenHandler has done its job

          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          debugAuth.log('❌ tokenHandler failed to process token');
          throw new Error('Token processing failed.');
        }

      } catch (error) {
        console.error('AuthCallbackRedirect error:', error);
        debugAuth.log('❌ Authentication process failed in AuthCallbackRedirect', { 
          error: error.message,
          stack: error.stack 
        });
        
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);
        
        // Clean up on error (tokenHandler.clearTokens() is called internally on error)
        setTimeout(() => {
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
        }, 4000);
      }
    };

    processAuthCallback();
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
