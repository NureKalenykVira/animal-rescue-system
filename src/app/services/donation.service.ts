import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Goal {
  id: number;
  name: string;
  description: string;
  need_amount: number;
  got_amount: number;
  created_at: string;
  ended_at: string | null;
}

export type Donation = Goal;

@Injectable({ providedIn: 'root' })
export class DonationService {
  private apiUrl = 'https://kkp-api.ruslan.page/api/donations';

  constructor(private http: HttpClient) {}

  getDonations(): Observable<{ count: number; result: Goal[] }> {
    return this.http.get<{ count: number; result: Goal[] }>(
      `${this.apiUrl}?page=1&page_size=50&order=asc&order_by=created_at`
    );
  }

  getDonationById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/${id}`);
  }
}
