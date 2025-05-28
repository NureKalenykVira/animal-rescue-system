import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  volunteers: any[] = [];
  reportToDelete: any = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';

  filters = {
    id: '',
    animalId: '',
    reportedById: '',
    assignedToId: '',
    orderBy: 'id',
    order: 'asc'
  };

  page = 1;
  pageSize = 50;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchReports();
    this.fetchVolunteers();
  }

  fetchReports(): void {
    const token = localStorage.getItem('access_token') || '';
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('page_size', this.pageSize.toString())
      .set('order_by', this.filters.orderBy)
      .set('order', this.filters.order);

    if (this.filters.id.trim() !== '') {
      params = params.set('id', this.filters.id);
    }
    if (this.filters.animalId.trim() !== '') {
      params = params.set('animal_id', this.filters.animalId);
    }
    if (this.filters.reportedById.trim() !== '') {
      params = params.set('reported_by_id', this.filters.reportedById);
    }
    if (this.filters.assignedToId.trim() !== '') {
      params = params.set('assigned_to_id', this.filters.assignedToId);
    }

    this.http.get<any>(`${this.apiUrl}/admin/animal-reports`, {
      headers: { 'x-token': token },
      params
    }).subscribe({
      next: res => {
        this.reports = res.result;
        console.log(this.reports);
        this.sortLocally();
      },
      error: err => console.error('Не вдалося отримати звіти:', err)
    });
  }

  fetchVolunteers(): void {
  const token = localStorage.getItem('access_token') || '';
  const params = new HttpParams()
    .set('page', '1')
    .set('page_size', '100')
    .set('role', '11');

  this.http.get<any>(`${this.apiUrl}/admin/users`, {
    headers: { 'x-token': token },
    params
  }).subscribe({
    next: res => {
      this.volunteers = res.result;
    },
    error: err => console.error('Не вдалося отримати волонтерів:', err)
  });
}

  applyFilters(): void {
    this.page = 1;
    this.fetchReports();
  }

  getFullName(user: any): string {
    return user ? `${user.first_name} ${user.last_name}` : 'Анонімно';
  }

  resetFilters(): void {
    this.filters = {
      id: '',
      animalId: '',
      reportedById: '',
      assignedToId: '',
      orderBy: 'id',
      order: 'asc'
    };
    this.page = 1;
    this.fetchReports();
  }

  saveReport(report: any): void {
    const token = localStorage.getItem('access_token') || '';
    const body = {
      assigned_to_id: report.assigned_to_id ?? null,
      notes: report.notes || ''
    };

    this.http.patch(`${this.apiUrl}/admin/animal-reports/${report.id}`, body, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => console.log('Звіт оновлено'),
      error: err => console.error('Помилка оновлення звіту:', err)
    });
  }

  openDeleteModal(report: any): void {
    this.reportToDelete = report;
  }

  cancelDelete(): void {
    this.reportToDelete = null;
  }

  confirmDelete(): void {
    if (!this.reportToDelete) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/animal-reports/${this.reportToDelete.id}`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== this.reportToDelete.id);
        this.reportToDelete = null;
      },
      error: err => {
        console.error('Не вдалося видалити звіт:', err);
        this.reportToDelete = null;
      }
    });
  }

  sortLocally(): void {
    const field = this.filters.orderBy;
    const direction = this.filters.order === 'asc' ? 1 : -1;

    this.reports.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (field === 'created_at') {
        aVal = a.created_at;
        bVal = b.created_at;
      } else if (field === 'id') {
        aVal = a.id;
        bVal = b.id;
      } else {
        return 0;
      }

      return (aVal - bVal) * direction;
    });
  }
}
