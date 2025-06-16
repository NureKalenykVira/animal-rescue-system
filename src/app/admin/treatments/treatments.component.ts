import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.scss']
})
export class TreatmentsComponent implements OnInit {
  treatments: any[] = [];
  treatmentToDelete: any = null;
  treatmentToPay: any = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';

  filters = {
    id: '',
    animalId: '',
    reportId: '',
    orderBy: 'id',
    order: 'asc',
    payoutStatus: ''
  };
  filterStatus: string = '';

  payoutStatusLabels: { [key: number]: string } = {
    0: 'не запитано',
    1: 'запитано',
    2: 'у обробці',
    3: 'виплачено',
  };

  page = 1;
  pageSize = 50;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTreatments();
  }

  fetchTreatments(): void {
    const token = localStorage.getItem('access_token') || '';

    // 🔹 Якщо фільтруємо за твариною — використовуємо окремий ендпоінт
    if (this.filters.animalId.trim() !== '') {
      const id = this.filters.animalId.trim();
      this.http.get<any>(`${this.apiUrl}/animals/${id}/treatment-reports`, {
        headers: { 'x-token': token }
      }).subscribe({
        next: res => {
          console.log('[DEBUG] Лікування по тварині:', res.result);
          this.treatments = res.result.map((t: any) => ({
            ...t,
            created_at: new Date(t.created_at * 1000).toLocaleString('uk-UA', {
              dateStyle: 'short',
              timeStyle: 'short'
            })
          }));
          this.sortLocally();
        },
        error: err => console.error('Не вдалося отримати лікування по тварині:', err)
      });
      return;
    }

    // 🔹 Загальний запит без animalId
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('page_size', this.pageSize.toString())
      .set('order_by', this.filters.orderBy)
      .set('order', this.filters.order);

    if (this.filters.id.trim() !== '') {
      params = params.set('id', this.filters.id);
    }
    if (this.filters.reportId.trim() !== '') {
      params = params.set('report_id', this.filters.reportId);
    }
    if (this.filters.payoutStatus) {
      params = params.set('payout_status', this.filters.payoutStatus);
    }

    this.http.get<any>(`${this.apiUrl}/admin/treatment-reports`, {
      headers: { 'x-token': token },
      params
    }).subscribe({
      next: res => {
        console.log('[DEBUG] Загальне лікування:', res.result);
        this.treatments = res.result.map((t: any) => ({
          ...t,
          created_at: new Date(t.created_at * 1000).toLocaleString('uk-UA', {
            dateStyle: 'short',
            timeStyle: 'short'
          })
        }));
        this.sortLocally();
      },
      error: err => console.error('Не вдалося отримати лікування:', err)
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchTreatments();
  }

  resetFilters(): void {
    this.filters = {
      id: '',
      animalId: '',
      reportId: '',
      orderBy: 'id',
      order: 'asc',
      payoutStatus: ''
    };
    this.page = 1;
    this.fetchTreatments();
  }

  openDeleteModal(treatment: any): void {
    this.treatmentToDelete = treatment;
  }

  cancelDelete(): void {
    this.treatmentToDelete = null;
  }

  confirmDelete(): void {
    if (!this.treatmentToDelete) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/treatment-reports/${this.treatmentToDelete.id}`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        this.treatments = this.treatments.filter(t => t.id !== this.treatmentToDelete.id);
        this.treatmentToDelete = null;
      },
      error: err => {
        console.error('Не вдалося видалити лікування:', err);
        this.treatmentToDelete = null;
      }
    });
  }

  openPayoutModal(treatment: any): void {
    this.treatmentToPay = treatment;
  }

  cancelPayout(): void {
    this.treatmentToPay = null;
  }

  confirmPayout(): void {
    if (!this.treatmentToPay) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.post(`${this.apiUrl}/admin/treatment-reports/${this.treatmentToPay.id}/payout`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        // TODO: replace treatment with new one without reloading whole page
        location.reload();
        //this.treatmentToPay = null;
      },
      error: err => {
        console.error('Не вдалося створити виплату для лікування:', err);
        this.treatmentToPay = null;
      }
    });
  }

  sortLocally(): void {
    const field = this.filters.orderBy;
    const direction = this.filters.order === 'asc' ? 1 : -1;

    this.treatments.sort((a, b) => {
      let aVal: any = a[field];
      let bVal: any = b[field];
      return (aVal - bVal) * direction;
    });
  }
}
