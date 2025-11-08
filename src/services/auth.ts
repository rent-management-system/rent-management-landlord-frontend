import { AuthTokens, User, LoginCredentials, DecodedToken } from '@/types/auth';

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  // Token management
  public setTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) || 
           sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || 
           sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public clearTokens(): void {
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    });
  }

  // User data management
  public setUser(user: User): void {
    const storage = localStorage.getItem(this.ACCESS_TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  public getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  public clearUser(): void {
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.USER_KEY);
    });
  }

  // Token validation
  public isTokenExpired(token: string): boolean {
    try {
      const decoded: DecodedToken = JSON.parse(atob(token.split('.')[1]));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  public isValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // Role-based access control
  public hasRole(requiredRole: string): boolean {
    const user = this.getUser();
    return user?.role === requiredRole;
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

  // Login/logout
  public async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthTokens> {
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
        throw new Error(errorData.detail || 'Login failed');
      }

      const tokens: AuthTokens = await response.json();
      this.setTokens(tokens, rememberMe);

      // Fetch user profile after successful login
      await this.fetchUserProfile(tokens.access_token);

      return tokens;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  private async fetchUserProfile(token: string): Promise<void> {
    try {
      const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user: User = await response.json();
        this.setUser(user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }

  public logout(): void {
    this.clearTokens();
    this.clearUser();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Token refresh
  public async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens: AuthTokens = await response.json();
      this.setTokens(tokens, !!localStorage.getItem(this.ACCESS_TOKEN_KEY));
      
      return tokens;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

export const authService = new AuthService();
