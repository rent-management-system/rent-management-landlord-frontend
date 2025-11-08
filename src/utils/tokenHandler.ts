import { authService } from '@/services/auth';
import { debugAuth } from '@/utils/debug';

class TokenHandler {
  /**
   * Enhanced token extraction from URL with better debugging
   */
  public handleTokenFromURL(): boolean {
    debugAuth.log('Checking URL for tokens from any auth endpoint');
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Check if we're on any auth callback path
    const isAuthCallback = window.location.pathname === '/auth/callback' || 
                          window.location.pathname === '/auth-redirect';
    
    debugAuth.log('Token check', { 
      path: window.location.pathname,
      isAuthCallback,
      hasToken: !!token 
    });

    if (token && isAuthCallback) {
      this.storeTokenFromURL(token, urlParams.get('role'));
      this.cleanURL();
      return true;
    }

    return false;
  }

  /**
   * Enhanced token storage from URL
   */
  private async storeTokenFromURL(token: string, role: string | null): Promise<void> {
    try {
      debugAuth.log('Storing token from URL', { tokenLength: token.length, role });

      // Validate token format (basic check)
      if (!this.isValidTokenFormat(token)) {
        throw new Error('Invalid token format from URL');
      }

      // Store in sessionStorage (more secure than localStorage for URL tokens)
      sessionStorage.setItem('access_token', token);
      
      debugAuth.log('Token stored in sessionStorage');

      // Verify token with backend to get full user data
      await this.verifyTokenWithBackend(token);
      
    } catch (error) {
      debugAuth.log('Failed to store token from URL', { error: error.message });
      this.clearTokens();
    }
  }

  /**
   * Basic token format validation
   */
  private isValidTokenFormat(token: string): boolean {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    const isValid = parts.length === 3;
    
    debugAuth.log('Token format validation', { isValid, partsCount: parts.length });
    
    return isValid;
  }

  /**
   * Remove token from URL for security
   */
  private cleanURL(): void {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      debugAuth.log('URL cleaned - token removed from address bar');
    }
  }

  /**
   * Enhanced token verification with backend
   */
  private async verifyTokenWithBackend(token: string): Promise<void> {
    debugAuth.log('Verifying token with backend');
    
    try {
      const response = await fetch('https://rent-managment-system-user-magt.onrender.com/api/v1/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        debugAuth.log('Token verification successful', {
          userId: userData.user_id,
          userRole: userData.role,
          userEmail: userData.email
        });
        
        // Store complete user data using authService
        authService.setUser({
          id: userData.user_id,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name || '',
          phone_number: userData.phone_number,
          preferred_language: userData.preferred_language || 'en',
          preferred_currency: userData.preferred_currency || 'ETB'
        });
        
        // Store tokens properly using authService
        authService.setTokens({
          access_token: token,
          refresh_token: '', // Will be obtained when needed
          token_type: 'Bearer',
          expires_in: 3600
        }, false); // sessionStorage
        
        debugAuth.log('User data and tokens stored successfully');
        
      } else {
        const errorText = await response.text();
        debugAuth.log('Token verification failed', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Token verification failed: ${response.status}`);
      }
    } catch (error) {
      debugAuth.log('Token verification error', { error: error.message });
      this.clearTokens();
      // Redirect to login or show error
      window.location.href = '/login?error=invalid_token';
    }
  }

  /**
   * Clear all stored tokens
   */
  public clearTokens(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_role');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    authService.clearTokens();
    
    debugAuth.log('All tokens cleared from all storage locations');
  }

  /**
   * Check if we have a valid token from any source (URL or storage)
   */
  public hasValidToken(): boolean {
    const isValid = authService.isValidToken();
    debugAuth.log('Valid token check', { isValid });
    return isValid;
  }

  /**
   * Force refresh of authentication state
   */
  public async refreshAuthState(): Promise<boolean> {
    debugAuth.log('Refreshing authentication state');
    
    try {
      // Check URL first
      const hasURLToken = this.handleTokenFromURL();
      
      if (hasURLToken) {
        debugAuth.log('Auth state refreshed from URL token');
        return true;
      }
      
      // If no URL token, check stored tokens
      const token = authService.getAccessToken();
      if (token && authService.isValidToken()) {
        // Refresh user data
        await authService.refreshUserData();
        debugAuth.log('Auth state refreshed from stored token');
        return true;
      }
      
      debugAuth.log('No valid authentication state found');
      return false;
    } catch (error) {
      debugAuth.log('Auth state refresh failed', { error: error.message });
      return false;
    }
  }
}

export const tokenHandler = new TokenHandler();
