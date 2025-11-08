import { useEffect, useState } from 'react';
import { tokenHandler } from '@/utils/tokenHandler';
import { useAuth } from '@/contexts/AuthContext';
import { debugAuth } from '@/utils/debug';

/**
 * Component that handles token initialization from URL parameters
 * Should be placed high in the component tree
 */
const TokenInitializer: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const initializeToken = async (): Promise<void> => {
      debugAuth.log('TokenInitializer: Starting initialization');
      
      try {
        // Check if we're on an auth redirect page
        const isAuthPage = window.location.pathname === '/auth-redirect' || 
                          window.location.pathname === '/login';
        
        if (!isAuthPage) {
          // For non-auth pages, check if we have a token in URL and process it
          const hasTokenInURL = tokenHandler.handleTokenFromURL();
          
          if (hasTokenInURL) {
            debugAuth.log('TokenInitializer: Token found and processed from URL');
            // Refresh auth state after processing URL token
            await refreshAuth();
          } else {
            debugAuth.log('TokenInitializer: No token in URL, checking stored tokens');
            // Just refresh auth state to check stored tokens
            await refreshAuth();
          }
        } else {
          debugAuth.log('TokenInitializer: On auth page, skipping URL token processing');
        }
        
        setIsInitialized(true);
      } catch (error) {
        debugAuth.log('TokenInitializer: Initialization failed', { error: error.message });
        setIsInitialized(true);
      }
    };

    initializeToken();
  }, [refreshAuth]);

  // Don't render anything - this is just an initializer
  return null;
};

export default TokenInitializer;
