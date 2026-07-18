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
}
