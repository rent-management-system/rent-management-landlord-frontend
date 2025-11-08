import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials } from '@/types/auth';
import { authService } from '@/services/auth';
import { tokenHandler } from '@/utils/tokenHandler';
import { debugAuth } from '@/utils/debug';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isTenant: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    debugAuth.log('AuthContext: Initializing authentication...');
    
    try {
      // First, check for tokens in URL (this handles redirects from login)
      const hasURLToken = tokenHandler.handleTokenFromURL();
      
      if (hasURLToken) {
        debugAuth.log('AuthContext: Token found in URL, processing...');
        // The token handler will automatically verify and set user data
        // Give it a moment to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Now check stored user data and tokens
      const storedUser = authService.getUser();
      const token = authService.getAccessToken();

      debugAuth.log('AuthContext: Storage check', {
        storedUser: !!storedUser,
        hasToken: !!token,
        tokenValid: token ? authService.isValidToken() : false
      });

      if (storedUser && token && authService.isValidToken()) {
        debugAuth.log('AuthContext: Valid user and token found', {
          userId: storedUser.id,
          userRole: storedUser.role
        });
        setUser(storedUser);
      } else if (token && authService.isTokenExpired(token)) {
        debugAuth.log('AuthContext: Token expired, attempting refresh');
        // Attempt to refresh token
        try {
          await authService.refreshToken();
          const refreshedUser = authService.getUser();
          setUser(refreshedUser);
          debugAuth.log('AuthContext: Token refreshed successfully', {
            user: refreshedUser ? refreshedUser.role : 'none'
          });
        } catch (refreshError) {
          debugAuth.log('AuthContext: Token refresh failed', { error: refreshError.message });
          authService.logout();
        }
      } else {
        debugAuth.log('AuthContext: No valid user/token found');
        authService.clearTokens();
      }
    } catch (error) {
      debugAuth.log('AuthContext: Initialization error', { error: error.message });
      authService.clearTokens();
    } finally {
      setIsLoading(false);
      debugAuth.log('AuthContext: Initialization finished', { isLoading: false });
    }
  };

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<void> => {
    try {
      setIsLoading(true);
      debugAuth.log('AuthContext: Login started', { email: credentials.username });
      
      await authService.login(credentials, rememberMe);
      const user = authService.getUser();
      
      debugAuth.log('AuthContext: Login successful', { 
        user: user ? `${user.email} (${user.role})` : 'none' 
      });
      
      setUser(user);
    } catch (error) {
      debugAuth.log('AuthContext: Login failed', { error: error.message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    debugAuth.log('AuthContext: Logout called');
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    const result = authService.hasRole(role);
    debugAuth.log('AuthContext: Role check', { requiredRole: role, result });
    return result;
  };

  const refreshAuth = async () => {
    debugAuth.log(' refreshAuth called');
    
    try {
      // Check both sessionStorage and localStorage
      let token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
      let userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
      
      debugAuth.log(' Tokens found', { 
        hasToken: !!token, 
        hasUserData: !!userData 
      });

      if (token && userData) {
        const user = JSON.parse(userData);
        debugAuth.log('✅ Setting authenticated state', user);
        
        setUser(user); // Update the user state
        // Set isAuthenticated to true and isLoading to false
        setIsLoading(false);
      } else {
        debugAuth.log('❌ No tokens/user data found');
        setUser(null); // Clear user state
        // Set isAuthenticated to false and isLoading to false
        setIsLoading(false);
      }
    } catch (error) {
      console.error('refreshAuth error:', error);
      setUser(null); // Clear user state on error
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isValidToken(),
    isLoading,
    login,
    logout,
    hasRole,
    isOwner: authService.isOwner(),
    isAdmin: authService.isAdmin(),
    isTenant: authService.isTenant(),
    refreshAuth,
  };

  debugAuth.log('AuthContext: Context Value', {
    isAuthenticated: !!user && authService.isValidToken(),
    isOwner: authService.isOwner(),
    isAdmin: authService.isAdmin(),
    isTenant: authService.isTenant(),
    User: user ? `${user.email} (${user.role})` : null
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};