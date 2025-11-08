import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tokenHandler } from '@/utils/tokenHandler';
import { debugAuth } from '@/utils/debug';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const LoginRedirect: React.FC = () => {
  const { user, isAuthenticated, isOwner, refreshAuth } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Processing authentication...');

  useEffect(() => {
    const processAuthentication = async () => {
      debugAuth.log('LoginRedirect: Starting authentication processing');
      
      try {
        // Check if we have a token in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        debugAuth.log('LoginRedirect: URL parameters', { token: !!token, error });

        if (error) {
          setStatus('error');
          setMessage(`Authentication error: ${error}`);
          return;
        }

        if (token) {
          debugAuth.log('LoginRedirect: Token found in URL, processing...');
          
          // Use the token handler to process the URL token
          const success = tokenHandler.handleTokenFromURL();
          
          if (success) {
            // Wait a moment for the token to be processed and user data to be loaded
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Refresh auth state to get the latest user data
            await refreshAuth();
            
            setStatus('success');
            setMessage('Authentication successful! Redirecting to dashboard...');
            
            // Redirect to main page after successful auth
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('Failed to process authentication token');
          }
        } else {
          // No token in URL, check if already authenticated
          if (isAuthenticated) {
            setStatus('success');
            setMessage('Already authenticated. Redirecting...');
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            throw new Error('No authentication token found in URL');
          }
        }
      } catch (error) {
        debugAuth.log('LoginRedirect: Authentication failed', { error: error.message });
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);
      }
    };

    processAuthentication();
  }, [isAuthenticated, refreshAuth]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoToLogin = () => {
    // Redirect to your main User Management login page
    window.location.href = 'https://rent-managment-system-user-magt.onrender.com/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Authentication</CardTitle>
          <CardDescription>
            Processing your login request...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          
          <p className="text-lg font-medium">{message}</p>
          
          {status === 'success' && isAuthenticated && user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Welcome, {user.full_name}!</p>
              <p className="text-green-600 text-sm">Role: {user.role}</p>
              <p className="text-green-600 text-sm">Email: {user.email}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Please try logging in again.</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} variant="outline">
                  Retry
                </Button>
                <Button onClick={handleGoToLogin}>
                  Go to Login
                </Button>
              </div>
            </div>
          )}
          
          {status === 'processing' && (
            <div className="text-sm text-muted-foreground">
              <p>Please wait while we verify your credentials...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginRedirect;
