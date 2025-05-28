/// <reference types="@types/google.maps" />
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vet-clinic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.scss']
})
export class ClinicsComponent implements OnInit {
  clinics: any[] = [];
  clinicToDelete: any = null;
  selectedClinic: any = null;
  selectedEmployees: any[] = [];
  localAdmins: any[] = [];
  newEmployeeEmail = '';
  isEmployeesModalOpen = false;
  isLocalAdmin = false;

  apiUrl = 'https://kkp-api.ruslan.page/api';

  filters = {
    id: '',
    adminId: '',
    orderBy: 'id',
    order: 'asc'
  };

  page = 1;
  pageSize = 50;

  newClinic = {
    name: '',
    latitude: 0,
    longitude: 0,
    admin_id: null,
    address: ''
  };
  isAddModalOpen = false;

  @ViewChild('addClinicMap') addClinicMapElement!: ElementRef;
  map!: google.maps.Map;
  marker!: google.maps.Marker;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const roleCode = localStorage.getItem('role');
    const token = localStorage.getItem('access_token') || '';

    if (roleCode === 'GlobalAdmin') {
      fetch('https://kkp-api.ruslan.page/api/admin/vet-clinic?page=1&page_size=100', {
        headers: { 'x-token': token }
      })
        .then(res => res.json())
        .then(data => {
          this.clinics = data.result.map((c: any) => ({
            ...c,
            admin_id: c.admin?.id || null
        }));
        this.resolveAddresses();
      });
      this.http.get<any>('https://kkp-api.ruslan.page/api/admin/users?role=100', {
        headers: { 'x-token': token }
      }).subscribe({
        next: res => this.localAdmins = res.result,
        error: err => console.error('Не вдалося отримати локальних адміністраторів', err)
      });
    } else if (roleCode === 'LocalAdmin') {
      this.isLocalAdmin = roleCode === 'LocalAdmin';
      const userId = localStorage.getItem('user_id');

      fetch('https://kkp-api.ruslan.page/api/admin/vet-clinic?page=1&page_size=100', {
        headers: { 'x-token': token }
      })
        .then(res => res.json())
        .then(data => {
          const matchedClinic = data.result.find((clinic: any) =>
            String(clinic.admin?.id) === userId
          );

          if (matchedClinic) {
            this.clinics = [matchedClinic];
            this.resolveAddresses();
          } else {
            console.warn('Клініка для LocalAdmin не знайдена');
            this.clinics = [];
          }
        })
        .catch(err => {
          console.error('Помилка при завантаженні клінік:', err);
          this.clinics = [];
        });
    }
  }

  fetchClinics(): void {
    const token = localStorage.getItem('access_token') || '';
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('page_size', this.pageSize.toString())
      .set('order_by', this.filters.orderBy)
      .set('order', this.filters.order);

    if (this.filters.id) params = params.set('id', this.filters.id);
    if (this.filters.adminId) params = params.set('admin_id', this.filters.adminId);

    this.http.get<any>(`${this.apiUrl}/admin/vet-clinic`, {
      headers: { 'x-token': token },
      params
    }).subscribe({
      next: res => {
        this.clinics = res.result;
        this.sortLocally();
      },
      error: err => console.error('Не вдалося отримати клініки:', err)
    });
  }

  openEmployeesModal(clinic: any): void {
    this.selectedClinic = clinic;
    this.newEmployeeEmail = '';
    this.isEmployeesModalOpen = true;
    this.loadEmployees(clinic.id);
  }

  loadEmployees(clinicId: number): void {
    const token = localStorage.getItem('access_token') || '';
    this.http.get<any>(`${this.apiUrl}/admin/vet-clinic/${clinicId}/employees`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: res => {
        this.selectedEmployees = res.result;
      },
      error: err => console.error('Не вдалося отримати працівників:', err)
    });
  }

  addEmployee(): void {
    const token = localStorage.getItem('access_token') || '';
    const body = { email: this.newEmployeeEmail };

    this.http.put(`${this.apiUrl}/admin/vet-clinic/${this.selectedClinic.id}/employees`, body, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => {
        this.newEmployeeEmail = '';
        this.loadEmployees(this.selectedClinic.id);
        this.selectedClinic.employees_count++;
      },
      error: err => console.error('Не вдалося додати працівника:', err)
    });
  }

  removeEmployee(userId: number): void {
    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/vet-clinic/${this.selectedClinic.id}/employees/${userId}`, {
      headers: { 'x-token': token }
  }).subscribe({
      next: () => {
        this.selectedEmployees = this.selectedEmployees.filter(e => e.id !== userId);
        this.selectedClinic.employees_count = Math.max(0, this.selectedClinic.employees_count - 1);
      },
      error: err => console.error('Не вдалося видалити працівника:', err)
    });
  }

  closeEmployeesModal(): void {
    this.selectedClinic = null;
    this.selectedEmployees = [];
    this.isEmployeesModalOpen = false;
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchClinics();
  }

  resetFilters(): void {
    this.filters = {
      id: '',
      adminId: '',
      orderBy: 'id',
      order: 'asc'
    };
    this.page = 1;
    this.fetchClinics();
  }

  sortLocally(): void {
    const field = this.filters.orderBy;
    const direction = this.filters.order === 'asc' ? 1 : -1;

    this.clinics.sort((a, b) => {
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

  saveClinic(clinic: any): void {
    const token = localStorage.getItem('access_token') || '';
    const body = {
      name: clinic.name,
      admin_id: clinic.admin_id,
      latitude: clinic.location?.latitude || 0,
      longitude: clinic.location?.longitude || 0
    };

    this.http.patch(`${this.apiUrl}/admin/vet-clinic/${clinic.id}`, body, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => console.log('Клініку оновлено'),
      error: err => console.error('Помилка оновлення клініки:', err)
    });
  }

  openDeleteModal(clinic: any): void {
    this.clinicToDelete = clinic;
  }

  cancelDelete(): void {
    this.clinicToDelete = null;
  }

  confirmDelete(): void {
    if (!this.clinicToDelete) return;

    const token = localStorage.getItem('access_token') || '';
    this.http.delete(`${this.apiUrl}/admin/vet-clinic/${this.clinicToDelete.id}`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: () => {
        this.clinics = this.clinics.filter(c => c.id !== this.clinicToDelete.id);
        this.clinicToDelete = null;
      },
      error: err => {
        console.error('Не вдалося видалити клініку:', err);
        this.clinicToDelete = null;
      }
    });
  }

  openAddModal(): void {
    this.newClinic = {
      name: '',
      latitude: 0,
      longitude: 0,
      admin_id: null,
      address: ''
    };
    this.isAddModalOpen = true;

    setTimeout(() => this.initAddClinicMap(), 100);
  }

  cancelAdd(): void {
    this.isAddModalOpen = false;
  }

  initAddClinicMap(): void {
    const fallbackCenter = { lat: 48.3794, lng: 31.1656 }; // Центр України
    const map = new google.maps.Map(this.addClinicMapElement.nativeElement, {
      center: fallbackCenter,
      zoom: 6
    });

    const geocoder = new google.maps.Geocoder();
    const marker = new google.maps.Marker({ map });

    navigator.geolocation?.getCurrentPosition((pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      map.setCenter(coords);
      map.setZoom(10);

      new google.maps.Marker({
        position: coords,
        map,
        title: 'Ваше місцезнаходження',
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
      });

      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location: coords,
          radius: 20000,
          keyword: 'ветеринарна клініка'
        },
        (results: any, status: any) => {
          if (status === 'OK') {
            results.forEach((place: any) => {
              new google.maps.Marker({
                position: place.geometry.location,
                map,
                title: place.name
              });
            });
          } else {
            console.warn('Не вдалося знайти клініки:', status);
          }
        }
      );
    }, () => {
      console.warn('Геолокацію не дозволено — карта залишиться в центрі України');
    });

    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      const latLng = event.latLng!;
      this.newClinic.latitude = latLng.lat();
      this.newClinic.longitude = latLng.lng();

      marker.setPosition(latLng);
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          this.newClinic.address = results[0].formatted_address;
        } else {
          this.newClinic.address = 'Адресу не знайдено';
        }
      });
    });

    this.map = map;
    this.marker = marker;
  }

  createClinic(): void {
    const token = localStorage.getItem('access_token') || '';
    const body = {
      name: this.newClinic.name,
      latitude: this.newClinic.latitude,
      longitude: this.newClinic.longitude,
      admin_id: this.newClinic.admin_id
    };

    this.http.post(`${this.apiUrl}/admin/vet-clinic`, body, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => {
        this.isAddModalOpen = false;
        this.fetchClinics();
      },
      error: err => {
        console.error('Помилка створення клініки:', err);
      }
    });
  }

  resolveAddresses(): void {
    const geocoder = new google.maps.Geocoder();

    this.clinics.forEach((clinic) => {
      const lat = clinic.location?.latitude;
      const lng = clinic.location?.longitude;

      if (lat && lng) {
        const latLng = { lat, lng };

        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            clinic.displayAddress = results[0].formatted_address;
          } else {
            clinic.displayAddress = 'Адресу не знайдено';
          }
        });
      } else {
        clinic.displayAddress = 'Координати відсутні';
      }
    });
  }
}
