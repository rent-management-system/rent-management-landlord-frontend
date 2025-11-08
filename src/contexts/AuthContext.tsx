import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthTokens, LoginCredentials } from '@/types/auth';
import { authService } from '@/services/auth';

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
    console.log('AuthContext: Initializing authentication...');
    try {
      const storedUser = authService.getUser();
      const token = authService.getAccessToken();
      const isValid = authService.isValidToken();

      console.log('AuthContext: Stored User:', storedUser);
      console.log('AuthContext: Access Token present:', !!token);
      console.log('AuthContext: Token is valid:', isValid);

      if (storedUser && token && isValid) {
        setUser(storedUser);
        console.log('AuthContext: User and valid token found. Setting user.');
      } else if (token && authService.isTokenExpired(token)) {
        console.log('AuthContext: Token expired. Attempting refresh...');
        // Attempt to refresh token
        try {
          await authService.refreshToken();
          const refreshedUser = authService.getUser();
          setUser(refreshedUser);
          console.log('AuthContext: Token refreshed. User set:', refreshedUser);
        } catch (refreshError) {
          console.error('AuthContext: Token refresh failed:', refreshError);
          authService.logout();
          console.log('AuthContext: Logout after refresh failure.');
        }
      } else {
        console.log('AuthContext: No valid user/token. Clearing tokens.');
        authService.clearTokens();
      }
    } catch (error) {
      console.error('AuthContext: Auth initialization error:', error);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Initialization finished. IsLoading set to false.');
    }
  };

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<void> => {
    console.log('AuthContext: Login initiated...');
    try {
      setIsLoading(true);
      await authService.login(credentials, rememberMe);
      const user = authService.getUser();
      setUser(user);
      console.log('AuthContext: Login successful. User set:', user);
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Login finished. IsLoading set to false.');
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
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
  };
  console.log('AuthContext: Context Value - isAuthenticated:', value.isAuthenticated, 'isOwner:', value.isOwner, 'isAdmin:', value.isAdmin, 'isTenant:', value.isTenant, 'User:', value.user);

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
