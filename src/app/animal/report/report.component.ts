/// <reference types="@types/google.maps" />
import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AnimalService } from '../../services/animal.service';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpBackend } from '@angular/common/http';

interface ReportPayload {
  name: string;
  breed: string;
  gender: number;
  notes: string;
  latitude: number;
  longitude: number;
  media_ids: number[];
  email?: string;
}

function fetchWithOptionalToken(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('x-token', token);
  }

  return fetch(url, {
    ...options,
    headers
  });
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements AfterViewInit, OnInit {
  reportForm: FormGroup;
  httpNoAuth = new HttpClient(inject(HttpBackend));

  photoURL: string | null = null;
  selectedFileName: string | null = null;
  selectedPhoto: File | null = null;

  selectedAddress: string | null = null;
  selectedCoords: { lat: number, lng: number } | null = null;

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  private map!: google.maps.Map;
  private marker!: google.maps.Marker;

  apiUrl = 'https://kkp-api.ruslan.page/api';
  isAuthenticated = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private animalService: AnimalService,
  ) {
    this.reportForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      gender: ['', Validators.required],
      notes: [''],
      email: ['', [Validators.required, Validators.email]],
      photo: ['', Validators.required],
      location: [null, Validators.required],
      address: this.selectedAddress,
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    this.isAuthenticated = !!token;
    const saved = sessionStorage.getItem('reportFormState');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.reportForm.patchValue(parsed.form);
      } catch (e) {
        console.warn('Не вдалося розпарсити збережену форму:', e);
      }
    }

    if (!this.isAuthenticated) {
      this.reportForm.get('email')?.setValidators([Validators.required, Validators.email]);
    } else {
      this.reportForm.get('email')?.clearValidators();
    }

    this.reportForm.get('email')?.updateValueAndValidity();
  }

  onSubmit(): void {
  console.log('onSubmit() called');

  if (!this.selectedAddress) {
    this.reportForm.get('location')?.setErrors({ required: true });
    console.warn('Адреса не вибрана');
  } else {
    this.reportForm.get('location')?.setValue(this.selectedAddress);
  }

  if (!this.photoURL) {
    this.reportForm.get('photo')?.setErrors({ required: true });
    console.warn('Фото не вибране');
  } else {
    this.reportForm.get('photo')?.setValue(this.selectedFileName);
  }

  console.log('Form valid:', this.reportForm.valid);
  console.log('Coords:', this.selectedCoords);
  console.log('Photo:', this.selectedPhoto);

  if (this.reportForm.valid && this.selectedCoords && this.selectedPhoto) {
    const file = this.selectedPhoto;
    console.log('Починаємо створення media...');

    const mediaPayload = {
      type: 1,
      size: file.size
    };

    fetchWithOptionalToken(`${this.apiUrl}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mediaPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося створити media');
        return res.json();
      })
      .then((res: any) => {
        console.log('Media створено:', res);
        const mediaId = res.id;
        const uploadUrl = res.upload_url;

        console.log('Завантаження фото на:', uploadUrl);
        return fetchWithOptionalToken(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        }).then(() => {
          console.log('Фото завантажено, фіналізуємо...');
          return fetchWithOptionalToken(`${this.apiUrl}/media/${mediaId}/finalize`, {
            method: 'POST'
          }).then(() => mediaId);
        });
      })
      .then((mediaId: number) => {
        console.log('Фіналізація завершена. Відправка звіту...');

        const genderRaw = this.reportForm.value.gender;
        const genderMap: { [key: string]: number } = {
          'Дівчинка': 2,
          'Хлопчик': 1,
          'Невідомо': 0
        };
        const gender = typeof genderRaw === 'string' ? genderMap[genderRaw] ?? 0 : genderRaw;

        const reportPayload: ReportPayload = {
          name: this.reportForm.value.name,
          breed: this.reportForm.value.type,
          gender: gender,
          notes: this.reportForm.value.notes,
          latitude: this.selectedCoords!.lat,
          longitude: this.selectedCoords!.lng,
          media_ids: [mediaId]
        };

        if (!this.isAuthenticated) {
          reportPayload.email = this.reportForm.value.email;
        }

        return this.animalService.reportAnimal(reportPayload).toPromise();
      })
      .then((report: any) => {
        console.log('Звіт надіслано');
        sessionStorage.removeItem('reportFormState');
        const animalId = report.animal?.id;
        const animalName = report.animal?.name;
        const imageUrl = report.media?.[0]?.url || report.animal?.media?.result?.[0]?.url || 'assets/img/animal-default.jpg';

        if (animalId) {
          fetch(`https://kkp-api.ruslan.page/api/subscriptions/${animalId}`, {
            method: 'PUT',
            headers: {
              'x-token': localStorage.getItem('access_token') || ''
            }
          }).then(() => {
            console.log(`Підписано на тварину ID ${animalId}`);
          }).catch(err => {
            console.warn('Не вдалося підписатися:', err);
          });

          const newAnimal = { id: animalId, name: animalName, image: imageUrl };

          this.router.navigate(['/animal/volunteer-search'], {
            state: { reportId: report.id, newAnimal }
          });
        }
        })
      .catch((err) => {
        console.error('Помилка в одному з етапів:', err);
        this.reportForm.setErrors({ submit: true });
      });
  } else {
    this.reportForm.markAllAsTouched();
    Object.keys(this.reportForm.controls).forEach((key) => {
      const control = this.reportForm.get(key);
      if (control && control.invalid) {
        console.warn(`Поле "${key}" невалідне:`, control.errors);
      }
    });
    console.warn('Форма невалідна або відсутні координати / фото');
  }
}


  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.selectedPhoto = file;
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoURL = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  ngAfterViewInit(): void {
    const checkIfGoogleLoaded = () => {
      if ((window as any).google && (window as any).google.maps) {
        this.initMap();
      } else {
        setTimeout(checkIfGoogleLoaded, 100);
      }
    };
    checkIfGoogleLoaded();
  }

  initMap(): void {
    const defaultLocation = { lat: 48.3794, lng: 31.1656 };
    const map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultLocation,
      zoom: 6
    });

    const geocoder = new google.maps.Geocoder();
    const marker = new google.maps.Marker({ map });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userLocation);
          map.setZoom(14);
        },
        error => {
          console.warn('Не вдалося отримати геолокацію:', error);
        }
      );
    }

    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      const latLng = event.latLng!;
      this.selectedCoords = { lat: latLng.lat(), lng: latLng.lng() };

      marker.setPosition(latLng);
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          this.selectedAddress = results[0].formatted_address;
        } else {
          this.selectedAddress = 'Адресу не знайдено';
        }
      });
    });
  }

  saveFormState(): void {
    const state = {
      form: this.reportForm.value,
      selectedCoords: this.selectedCoords,
      selectedAddress: this.selectedAddress,
      selectedFileName: this.selectedFileName,
      photoURL: this.photoURL
    };
    sessionStorage.setItem('reportFormState', JSON.stringify(state));
  }


  goToRegister(): void {
    this.saveFormState();
    this.router.navigate(['/auth/register'], { queryParams: { returnTo: '/animal/report' } });
  }

  goToLogin(): void {
    this.saveFormState();
    this.router.navigate(['/auth/login'], { queryParams: { returnTo: '/animal/report' } });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
