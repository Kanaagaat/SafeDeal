import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  balance?: number;
  escrow_balance?: number;
  trust_score?: number;
}

interface AuthTokensResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = environment.apiUrl;

  private readonly tokenSignal = signal<string | null>(this.getStoredToken('access'));
  private readonly refreshTokenSignal = signal<string | null>(this.getStoredToken('refresh'));
  private readonly userSignal = signal<AuthUser | null>(this.getStoredUser());

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly currentUser = computed(() => this.userSignal());
  readonly currentToken = computed(() => this.tokenSignal());

  login(credentials: { username: string; password: string }): Observable<AuthTokensResponse> {
    return this.http.post<AuthTokensResponse>(`${this.api}/login/`, credentials).pipe(
      tap((res) => this.setSession(res))
    );
  }

  /** Registers user; does not start a session (user should log in). */
  register(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Observable<AuthTokensResponse> {
    return this.http.post<AuthTokensResponse>(`${this.api}/register/`, data);
  }

  logout(): void {
    const refresh = this.refreshTokenSignal();
    if (refresh) {
      this.http.post(`${this.api}/logout/`, { refresh }).subscribe({
        complete: () => this.finalizeLogout(),
        error: () => this.finalizeLogout()
      });
    } else {
      this.finalizeLogout();
    }
  }

  private finalizeLogout(): void {
    this.clearSession();
    void this.router.navigate(['/auth']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.refreshTokenSignal();
    if (!refresh) {
      this.clearSession();
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<{ access: string }>(`${this.api}/token/refresh/`, { refresh }).pipe(
      tap((res) => {
        this.tokenSignal.set(res.access);
        localStorage.setItem('access_token', res.access);
      }),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  getCurrentUser(): AuthUser | null {
    return this.userSignal();
  }

  /** Hydrate user from API (optional). */
  loadProfileIntoSession(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.api}/user/profile/`).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSignal.set(user);
      })
    );
  }

  updateLocalUserBalance(balance: number, escrow_balance: number): void {
    const u = this.userSignal();
    if (!u) return;
    const next = { ...u, balance, escrow_balance };
    localStorage.setItem('user', JSON.stringify(next));
    this.userSignal.set(next);
  }

  private setSession(auth: AuthTokensResponse): void {
    localStorage.setItem('access_token', auth.access);
    localStorage.setItem('refresh_token', auth.refresh);
    if (auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
      this.userSignal.set(auth.user);
    }
    this.tokenSignal.set(auth.access);
    this.refreshTokenSignal.set(auth.refresh);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.userSignal.set(null);
  }

  private getStoredToken(type: 'access' | 'refresh'): string | null {
    return localStorage.getItem(`${type}_token`);
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
