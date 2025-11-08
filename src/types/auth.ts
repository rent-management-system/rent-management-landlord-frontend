export interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'TENANT' | 'ADMIN' | 'BROKER';
  full_name: string;
  phone_number?: string;
  preferred_language: string;
  preferred_currency: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface DecodedToken {
  user_id: string;
  role: string;
  email: string;
  exp: number;
  iat: number;
}
