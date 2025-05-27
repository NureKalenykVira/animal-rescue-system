import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private apiUrl = 'https://kkp-api.ruslan.page/api';

  constructor(private http: HttpClient) {}

  reportAnimal(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/animal-reports`, data);
  }

  getAnimalReports(lat: number, lon: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/animal-reports/recent?lat=${lat}&lon=${lon}`);
  }

  assignToReport(reportId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/animal-reports/${reportId}/assign`, {});
  }

  getAnimalReportById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/animal-reports/${id}`);
  }

  getAnimalById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/animals/${id}`);
  }

  getUserSubscriptions() {
    return this.http.get<any>(`${this.apiUrl}/subscriptions`);
  }

  followAnimal(animalId: number, token: string) {
    return this.http.put(`${this.apiUrl}/subscriptions/${animalId}`, {}, {
      headers: {
        'x-token': token
      }
    });
  }

  unfollowAnimal(animalId: number, token: string) {
    return this.http.delete(`${this.apiUrl}/subscriptions/${animalId}`, {
      headers: {
        'x-token': token
      }
    });
  }
}
