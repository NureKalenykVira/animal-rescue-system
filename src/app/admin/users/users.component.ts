import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  userToDelete: any = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';

  filters = {
    id: '',
    role: '',
    hasMfa: '',
    orderBy: 'id',
    order: 'asc'
  };

  page = 1;
  pageSize = 50;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    const token = localStorage.getItem('access_token') || '';
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('page_size', this.pageSize.toString());

    if (this.filters.id) params = params.set('id', this.filters.id);
    if (this.filters.role) params = params.set('role', this.filters.role);
    if (this.filters.hasMfa) params = params.set('has_mfa', this.filters.hasMfa);

    this.http.get<any>(`${this.apiUrl}/admin/users`, {
      headers: { 'x-token': token },
      params
    }).subscribe({
      next: res => {
        this.users = res.result;
        this.sortLocally(); // завжди сортуємо Angular-ом
      },
      error: err => console.error('Не вдалося отримати користувачів:', err)
    });
  }

  sortLocally(): void {
    const field = this.filters.orderBy;
    const direction = this.filters.order === 'asc' ? 1 : -1;

    this.users.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (field === 'id') {
        return (aVal - bVal) * direction;
      }

      const valA = (aVal || '').toString().toLowerCase();
      const valB = (bVal || '').toString().toLowerCase();

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchUsers();
  }

  resetFilters(): void {
    this.filters = {
      id: '',
      role: '',
      hasMfa: '',
      orderBy: 'id',
      order: 'asc'
    };
    this.page = 1;
    this.fetchUsers();
  }

  saveUser(user: any): void {
    const token = localStorage.getItem('access_token') || '';
    const body: any = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      telegram_username: user.telegram_username,
      viber_phone: user.viber_phone,
      whatsapp_phone: user.whatsapp_phone,
      role: user.role
    };

    if ('mfa_enabled' in user) {
      body.disable_mfa = !user.mfa_enabled;
    }

    this.http.patch(`${this.apiUrl}/admin/users/${user.id}`, body, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => console.log('Користувача оновлено'),
      error: err => console.error('Помилка оновлення:', err)
    });
  }

  openDeleteModal(user: any): void {
    this.userToDelete = user;
  }

  cancelDelete(): void {
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/users/${this.userToDelete.id}`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete.id);
        this.userToDelete = null;
      },
      error: err => {
        console.error('Не вдалося видалити користувача:', err);
        this.userToDelete = null;
      }
    });
  }
}
