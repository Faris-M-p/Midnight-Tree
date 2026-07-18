export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  familyCode: string;
  familyName: string;
  description?: string;
}

export interface RegisterResponse {
  accountId: number;
  familyId: number;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  tokenType: string;
  refreshToken?: string;
  user?: AuthUser;
}

export interface AuthUser {
  id?: number;
  username?: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  tokenType: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
}
