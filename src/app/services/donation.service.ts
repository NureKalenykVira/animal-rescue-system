import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Donation {
  id: number;
  name: string;
  description: string;
  need_amount: number;
  got_amount: number;
  created_at: string;
  ended_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class DonationService {
  private apiUrl = 'https://kkp-api.ruslan.page/api/donations';

  constructor(private http: HttpClient) {}

  getDonations(): Observable<{ count: number; result: Donation[] }> {
    return this.http.get<{ count: number; result: Donation[] }>(
      `${this.apiUrl}?page=1&page_size=50&order=asc&order_by=created_at`
    );
  }

  getDonationById(id: number): Observable<Donation> {
    return this.http.get<Donation>(`${this.apiUrl}/${id}`);
  }
}
