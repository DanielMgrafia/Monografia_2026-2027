import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth';
import { Usuario } from '../models/usuario';

const STORAGE_KEY = 'repositorio-academico-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:7225/api/auth';
  private readonly sessionState = signal<AuthResponse | null>(this.readStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly currentUser = computed<Usuario | null>(() => this.sessionState()?.usuario ?? null);
  readonly permissions = computed(() => new Set(this.currentUser()?.permisos ?? []));
  readonly roles = computed(() => this.currentUser()?.roles ?? []);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    this.sessionState.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  getToken(): string | null {
    return this.sessionState()?.token ?? null;
  }

  hasPermission(permission: string): boolean {
    return this.permissions().has(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const currentPermissions = this.permissions();
    return permissions.some((permission) => currentPermissions.has(permission));
  }

  private setSession(session: AuthResponse): void {
    this.sessionState.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private readStoredSession(): AuthResponse | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      const session = JSON.parse(stored) as AuthResponse;
      const expiration = new Date(session.expiraEn).getTime();
      if (Number.isNaN(expiration) || expiration <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
