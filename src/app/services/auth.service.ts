import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://kkp-api.ruslan.page/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res: any) => {
        const token = res?.token?.replace(/^Bearer\s+/i, '');
        if (token) {
          localStorage.setItem('access_token', token);
          console.log('[AuthService] Збережено токен:', token);
        } else {
          console.warn('[AuthService] Немає поля token у відповіді:', res);
        }
      })
    );
  }

  register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeToken(token: string) {
    localStorage.setItem('access_token', token.replace(/^Bearer\\s+/i, ''));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  requestPasswordReset(data: { email: string }) {
    return this.http.post(`${this.apiUrl}/auth/reset-password/request`, data);
  }

  resetPassword(data: { reset_token: string, new_password: string }) {
    return this.http.post(`${this.apiUrl}/auth/reset-password/reset`, data);
  }

  getGoogleAuthUrl() {
    return this.http.get<{ url: string }>(`${this.apiUrl}/auth/google`);
  }

  handleGoogleCallback(params: { code: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google/callback`, {
      code: params.code
    });
  }

  getUserInfo() {
    return this.http.get<any>('https://kkp-api.ruslan.page/api/user/info', {
      headers: {
        'x-token': localStorage.getItem('access_token') || ''
      }
    });
  }
}
