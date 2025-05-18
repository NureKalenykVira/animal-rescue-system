/// <reference types="@types/google.maps" />

import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements AfterViewInit {
  reportForm: FormGroup;

  photoURL: string | null = null;
  selectedFileName: string | null = null;

  selectedAddress: string | null = null;
  selectedCoords: { lat: number, lng: number } | null = null;

  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  private map!: google.maps.Map;
  private marker!: google.maps.Marker;

  constructor(private fb: FormBuilder, private router: Router) {
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

  onSubmit(): void {
    if (!this.selectedAddress) {
      this.reportForm.get('location')?.setErrors({ required: true });
    } else {
      this.reportForm.get('location')?.setValue(this.selectedAddress);
    }

    if (!this.photoURL) {
      this.reportForm.get('photo')?.setErrors({ required: true });
    } else {
      this.reportForm.get('photo')?.setValue(this.selectedFileName);
    }

    if (this.reportForm.valid) {
      console.log('Form data:', this.reportForm.value);
      console.log('Координати:', this.selectedCoords);
      console.log('Адреса:', this.selectedAddress);

      this.router.navigate(['/animal/volunteer-search']);
    } else {
      this.reportForm.markAllAsTouched();
    }
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
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

    // Відцентровка карти за геолокацією пристрою
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
          console.log('Адреса з геокодера:', this.selectedAddress);
        } else {
          this.selectedAddress = 'Адресу не знайдено';
          console.warn('Geocoder status:', status);
        }
      });
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register'], { queryParams: { returnTo: '/animal/report' } });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { returnTo: '/animal/report' } });
  }

  isAuthenticated = false; // тимчасово false

  ngOnInit(): void {
    // коли буде бекенд — отримаємо з authService
    const token = localStorage.getItem('token'); // або sessionStorage
    this.isAuthenticated = !token;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
