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
    try {
      const storedUser = authService.getUser();
      const token = authService.getAccessToken();

      if (storedUser && token && authService.isValidToken()) {
        setUser(storedUser);
      } else if (token && authService.isTokenExpired(token)) {
        // Attempt to refresh token
        try {
          await authService.refreshToken();
          const refreshedUser = authService.getUser();
          setUser(refreshedUser);
        } catch {
          authService.logout();
        }
      } else {
        authService.clearTokens();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.login(credentials, rememberMe);
      const user = authService.getUser();
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
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
