export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  displayName: string;
}

export interface AuthUser {
  email: string;
  displayName: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}
