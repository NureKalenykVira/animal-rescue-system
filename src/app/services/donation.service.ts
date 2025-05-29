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
  private lastCreatedDonationId: number = 0;

  constructor(private http: HttpClient) {}

  getDonations(): Observable<{ count: number; result: Goal[] }> {
    return this.http.get<{ count: number; result: Goal[] }>(
      `${this.apiUrl}?page=1&page_size=50&order=asc&order_by=created_at`
    );
  }

  getDonationById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/${id}`);
  }

  createPaypalOrder(goalId: number, formData: any, token: string): Promise<string> {
   return fetch(`https://kkp-api.ruslan.page/api/donations/${goalId}/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        this.lastCreatedDonationId = data.id;
        return data.paypal_id;
      });
  }

  confirmPaypalDonation(goalId: number, donationId: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${goalId}/donations/${donationId}`, payload);
  }

  getLastDonationId(): number {
    return this.lastCreatedDonationId;
  }
}
