import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegisterRequest, TokenResponse } from '../models/api.models';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  status: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<TokenResponse | null>(null);
  private refreshRequest: Observable<string | null> | null = null;

  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((tokens) => this.session.set(tokens)),
    );
  }

  register(details: RegisterRequest): Observable<RegisteredUser> {
    return this.http.post<RegisteredUser>(`${environment.apiUrl}/auth/register`, details);
  }

  requestVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/email-verification/request`, { email });
  }

  confirmVerification(details: { token: string; firstName: string; lastName: string }): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/email-verification/confirm`, details);
  }

  refreshSession(): Observable<string | null> {
    if (this.refreshRequest) return this.refreshRequest;
    const refreshToken = this.session()?.refreshToken;
    if (!refreshToken) return of(null);

    this.refreshRequest = this.http.post<TokenResponse>(`${environment.apiUrl}/auth/token/refresh`, refreshToken).pipe(
      tap((tokens) => this.session.set(tokens)),
      map((tokens) => tokens.accessToken),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      finalize(() => this.refreshRequest = null),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshRequest;
  }

  logout(): void {
    const refreshToken = this.session()?.refreshToken;
    this.session.set(null);

    if (refreshToken) {
      this.http.post<void>(`${environment.apiUrl}/auth/logout`, refreshToken).subscribe({
        error: () => undefined,
      });
    }
  }

  clearSession(): void {
    this.session.set(null);
  }
}