import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {
  media: any[] = [];
  mediaToDelete: any = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';

  filters = {
    type: '',
    status: '',
    uploadedById: '',
    orderBy: 'id',
    order: 'asc'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMedia();
  }

  fetchMedia(): void {
    const token = localStorage.getItem('access_token') || '';
    let params = new HttpParams()
      .set('order_by', this.filters.orderBy)
      .set('order', this.filters.order);

    if (this.filters.type.trim() !== '') {
      params = params.set('type', this.filters.type);
    }
    if (this.filters.status.trim() !== '') {
      params = params.set('status', this.filters.status);
    }
    if (this.filters.uploadedById.trim() !== '') {
      params = params.set('uploaded_by_id', this.filters.uploadedById);
    }

    this.http.get<any>(`${this.apiUrl}/admin/media`, {
      headers: { 'x-token': token },
      params
    }).subscribe({
      next: res => {
        this.media = res.result.map((m: any) => ({
          ...m,
          uploaded_at: new Date(m.uploaded_at * 1000).toLocaleString('uk-UA', {
            dateStyle: 'short',
            timeStyle: 'short'
          })
        }));
      },
      error: err => console.error('Не вдалося отримати медіа:', err)
    });
  }

  applyFilters(): void {
    this.fetchMedia();
  }

  resetFilters(): void {
    this.filters = {
      type: '',
      status: '',
      uploadedById: '',
      orderBy: 'id',
      order: 'asc'
    };
    this.fetchMedia();
  }

  openDeleteModal(m: any): void {
    this.mediaToDelete = m;
  }

  cancelDelete(): void {
    this.mediaToDelete = null;
  }

  confirmDelete(): void {
    if (!this.mediaToDelete) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/media/${this.mediaToDelete.id}`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        this.media = this.media.filter(m => m.id !== this.mediaToDelete.id);
        this.mediaToDelete = null;
      },
      error: err => {
        console.error('Не вдалося видалити медіа:', err);
        this.mediaToDelete = null;
      }
    });
  }
}
