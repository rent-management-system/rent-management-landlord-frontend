import { AuthTokens, User, LoginCredentials, DecodedToken } from '@/types/auth';
import { debugAuth } from '@/utils/debug';

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  // Enhanced token management
  public setTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    try {
      storage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
      storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
      
      debugAuth.log('Tokens stored successfully', {
        storage: rememberMe ? 'localStorage' : 'sessionStorage',
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token
      });
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  public getAccessToken(): string | null {
    try {
      // Check both storage locations
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY) || 
                   sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      debugAuth.log('Retrieving access token', {
        found: !!token,
        source: localStorage.getItem(this.ACCESS_TOKEN_KEY) ? 'localStorage' : 
                sessionStorage.getItem(this.ACCESS_TOKEN_KEY) ? 'sessionStorage' : 'none'
      });
      
      return token;
    } catch (error) {
      console.error('Error accessing storage:', error);
      return null;
    }
  }

  public getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY) || 
             sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error accessing storage:', error);
      return null;
    }
  }

  public clearTokens(): void {
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    });
    
    debugAuth.log('All tokens cleared');
  }

  // Enhanced user data management
  public setUser(user: User): void {
    try {
      const storage = localStorage.getItem(this.ACCESS_TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(this.USER_KEY, JSON.stringify(user));
      
      debugAuth.log('User data stored', {
        userId: user.id,
        userRole: user.role,
        userEmail: user.email
      });
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  public getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      
      if (userData) {
        const user = JSON.parse(userData);
        debugAuth.log('Retrieved user data', {
          userId: user.id,
          userRole: user.role,
          userEmail: user.email
        });
        return user;
      }
      
      debugAuth.log('No user data found in storage');
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  public clearUser(): void {
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.USER_KEY);
    });
  }

  // Enhanced token validation
  public isTokenExpired(token: string): boolean {
    try {
      const decoded: DecodedToken = JSON.parse(atob(token.split('.')[1]));
      const isExpired = decoded.exp * 1000 < Date.now();
      
      debugAuth.log('Token expiration check', {
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        isExpired,
        currentTime: new Date().toISOString()
      });
      
      return isExpired;
    } catch {
      debugAuth.log('Token format invalid - considering expired');
      return true;
    }
  }

  public isValidToken(): boolean {
    const token = this.getAccessToken();
    
    if (!token) {
      debugAuth.log('No token found - invalid');
      return false;
    }
    
    const isValid = !this.isTokenExpired(token);
    debugAuth.log('Token validity check', { isValid });
    
    return isValid;
  }

  // Enhanced role-based access control
  public hasRole(requiredRole: string): boolean {
    const user = this.getUser();
    const hasRole = user?.role === requiredRole;
    
    debugAuth.log('Role check', {
      requiredRole,
      userRole: user?.role,
      hasRequiredRole: hasRole,
      userExists: !!user
    });
    
    return hasRole;
  }

  public isOwner(): boolean {
    return this.hasRole('OWNER');
  }

  public isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  public isTenant(): boolean {
    return this.hasRole('TENANT');
  }

  // Enhanced login with better error handling
  public async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthTokens> {
    debugAuth.log('Login attempt started', { email: credentials.username, rememberMe });
    
    try {
      const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        debugAuth.log('Login failed - server error', { status: response.status, error: errorData });
        throw new Error(errorData.detail || `Login failed with status: ${response.status}`);
      }

      const tokens: AuthTokens = await response.json();
      debugAuth.log('Login successful - tokens received', { 
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token
      });

      this.setTokens(tokens, rememberMe);

      // Fetch user profile after successful login
      await this.fetchUserProfile(tokens.access_token);

      return tokens;
    } catch (error) {
      debugAuth.log('Login failed - network error', { error: error.message });
      throw new Error(error instanceof Error ? error.message : 'Login failed due to network error');
    }
  }

  private async fetchUserProfile(token: string): Promise<void> {
    debugAuth.log('Fetching user profile started');
    
    try {
      const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user: User = await response.json();
        this.setUser(user);
        debugAuth.log('User profile fetched successfully', { 
          userId: user.id, 
          userRole: user.role,
          userEmail: user.email 
        });
      } else {
        const errorData = await response.json();
        debugAuth.log('Failed to fetch user profile', { status: response.status, error: errorData });
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
    } catch (error) {
      debugAuth.log('User profile fetch failed', { error: error.message });
      console.error('Failed to fetch user profile:', error);
      // Don't throw here - we still have tokens even if profile fetch fails
    }
  }

  public logout(): void {
    debugAuth.log('Logout initiated');
    this.clearTokens();
    this.clearUser();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Enhanced token refresh
  public async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      debugAuth.log('Refresh failed - no refresh token');
      throw new Error('No refresh token available');
    }

    debugAuth.log('Token refresh attempt started');

    try {
      const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        debugAuth.log('Token refresh failed - server error', { status: response.status });
        throw new Error('Token refresh failed');
      }

      const tokens: AuthTokens = await response.json();
      const usingLocalStorage = !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      this.setTokens(tokens, usingLocalStorage);
      
      debugAuth.log('Token refresh successful', { 
        usingLocalStorage,
        hasNewAccessToken: !!tokens.access_token
      });
      
      return tokens;
    } catch (error) {
      debugAuth.log('Token refresh failed - network error', { error: error.message });
      this.logout();
      throw error;
    }
  }

  // New method: Force refresh user data
  public async refreshUserData(): Promise<User | null> {
    const token = this.getAccessToken();
    
    if (!token) {
      debugAuth.log('Cannot refresh user data - no token');
      return null;
    }

    try {
      await this.fetchUserProfile(token);
      return this.getUser();
    } catch (error) {
      debugAuth.log('User data refresh failed', { error: error.message });
      return null;
    }
  }
}

export const authService = new AuthService();