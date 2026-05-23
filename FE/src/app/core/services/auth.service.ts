import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  AuthState,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.models';

const REFRESH_TOKEN_KEY = 'fintrack_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = environment.apiUrl + '/api/auth';

  private readonly _state = signal<AuthState>({ user: null, accessToken: null });

  readonly authState = this._state.asReadonly();
  readonly isAuthenticated = computed(() => !!this._state().accessToken);
  readonly currentUser = computed(() => this._state().user);

  get accessToken(): string | null {
    return this._state().accessToken;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, request).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, request).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (token) {
      this.http.post(`${this.api}/logout`, { refreshToken: token }).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshTokens(): Observable<AuthResponse | null> {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!token) return of(null);

    return this.http
      .post<AuthResponse>(`${this.api}/refresh`, { refreshToken: token })
      .pipe(
        tap((res) => this.setSession(res)),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/reset-password`, request);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    this._state.set({
      accessToken: res.accessToken,
      user: { email: res.email, displayName: res.displayName },
    });
  }

  private clearSession(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._state.set({ user: null, accessToken: null });
  }
}
