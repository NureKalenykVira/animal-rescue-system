import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animals.component.html',
  styleUrls: ['./animals.component.scss']
})
export class AnimalsComponent implements OnInit {
  animals: any[] = [];
  animalToDelete: any = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';

  filters = {
    id: '',
    status: '',
    orderBy: 'id',
    order: 'asc'
  };

  page = 1;
  pageSize = 50;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAnimals();
  }

  fetchAnimals(): void {
    const token = localStorage.getItem('access_token') || '';
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('page_size', this.pageSize.toString());

    if (this.filters.id) params = params.set('id', this.filters.id);
    if (this.filters.status !== '') params = params.set('status', this.filters.status);

    this.http.get<any>(`${this.apiUrl}/admin/animals`, {
      headers: { 'x-token': token },
      params
    }).subscribe({
      next: res => {
        this.animals = res.result;
        this.sortLocally();
      },
      error: err => console.error('Не вдалося отримати тварин:', err)
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchAnimals();
  }

  resetFilters(): void {
    this.filters = {
      id: '',
      status: '',
      orderBy: 'id',
      order: 'asc'
    };
    this.page = 1;
    this.fetchAnimals();
  }

  sortLocally(): void {
    const field = this.filters.orderBy;
    const direction = this.filters.order === 'asc' ? 1 : -1;

    this.animals.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (field === 'id') return (aVal - bVal) * direction;

      const valA = (aVal || '').toString().toLowerCase();
      const valB = (bVal || '').toString().toLowerCase();

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }

  saveAnimal(animal: any): void {
    const token = localStorage.getItem('access_token') || '';
    const body = {
      name: animal.name,
      breed: animal.breed,
      status: animal.status,
      gender: animal.gender,
      description: animal.description
    };

    this.http.patch(`${this.apiUrl}/admin/animals/${animal.id}`, body, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => console.log('Тварину оновлено'),
      error: err => console.error('Помилка оновлення тварини:', err)
    });
  }

  openDeleteModal(animal: any): void {
    this.animalToDelete = animal;
  }

  cancelDelete(): void {
    this.animalToDelete = null;
  }

  confirmDelete(): void {
    if (!this.animalToDelete) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/animals/${this.animalToDelete.id}`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        this.animals = this.animals.filter(a => a.id !== this.animalToDelete.id);
        this.animalToDelete = null;
      },
      error: err => {
        console.error('Не вдалося видалити тварину:', err);
        this.animalToDelete = null;
      }
    });
  }
}
