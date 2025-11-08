import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { tokenHandler } from '@/utils/tokenHandler';
import { debugAuth } from '@/utils/debug';
import { Loader2 } from 'lucide-react';

const AuthCallbackRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const processToken = async () => {
      debugAuth.log('AuthCallbackRedirect: Processing token from /auth/callback');
      
      const token = searchParams.get('token');
      const role = searchParams.get('role');

      debugAuth.log('AuthCallbackRedirect: URL parameters', { token: !!token, role });

      if (token) {
        try {
          // Store the token from URL
          sessionStorage.setItem('access_token', token);
          debugAuth.log('✅ Token stored from /auth/callback');

          // Verify token with backend
          const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            debugAuth.log('✅ Token verified successfully', userData);

            // Store user data
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
            debugAuth.log('✅ User data stored from /auth/callback');

            // Refresh auth context
            await refreshAuth();

            // Clean URL and redirect to main page
            if (window.history.replaceState) {
              window.history.replaceState({}, document.title, '/');
            }

            debugAuth.log('✅ Redirecting to main page');
            window.location.href = '/';

          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          debugAuth.log('❌ AuthCallbackRedirect failed', { error: error.message });
          // Redirect to error page or login
          window.location.href = '/login?error=token_verification_failed';
        }
      } else {
        debugAuth.log('❌ No token found in /auth/callback');
        window.location.href = '/login?error=no_token';
      }
    };

    processToken();
  }, [searchParams, refreshAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-lg font-medium">Processing authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Redirecting from User Management app
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackRedirect;
