import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://kkp-api.ruslan.page/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('[UserService] Отримано токен із AuthService:', token);

    return new HttpHeaders({
      'x-token': token || ''
    });
  }

  getUserInfo(): Observable<any> {
    const headers = this.getHeaders();
    console.log('[UserService] GET /user/info з заголовками:', headers);
    headers.keys().forEach(key => {
      console.log(`${key}:`, headers.get(key));
    });

    return this.http.get(`${this.apiUrl}/user/info`, { headers: this.getHeaders() });
}

  updateUserInfo(data: any): Observable<any> {
    const headers = this.getHeaders();
    console.log('[UserService] PATCH /user/info з заголовками:', headers);
    console.log('[UserService] Дані:', data);

    return this.http.patch(`${this.apiUrl}/user/info`, data, { headers });
  }

  getSubscriptions(): Observable<any> {
    const headers = this.getHeaders();
    console.log('[UserService] GET /subscriptions з заголовками:', headers);

    return this.http.get(`${this.apiUrl}/subscriptions`, { headers });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(`${this.apiUrl}/user/password`, {
      old_password: oldPassword,
      new_password: newPassword
    }, { headers });
  }
}
