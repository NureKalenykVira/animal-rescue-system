/// <reference types="@types/google.maps" />

import { AfterViewInit, OnInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnimalService } from '../../services/animal.service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-animal-notification',
  standalone: true,
  templateUrl: './animal-notification.component.html',
  styleUrls: ['./animal-notification.component.scss'],
  imports: [NgIf, RouterModule],
})
export class AnimalNotificationComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  reportData: any = null;

  messages: { id: number; title: string }[] = [
    { id: 999, title: 'Нова тварина' }
  ];

  animals: { id: number; name: string; image: string }[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private animalService: AnimalService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const reportId = Number(this.route.snapshot.paramMap.get('id'));
    if (!reportId) {
      console.warn('ID звіту не передано');
      this.goBack();
      return;
    }

    this.animalService.getAnimalReportById(reportId).subscribe({
      next: report => {
        this.reportData = {
          id: report.id,
          name: report.animal.name,
          type: report.animal.breed,
          gender: 'Невідомо',
          notes: report.notes,
          photoUrl: report.media?.[0]?.url || 'assets/img/animal-default.jpg',
          address: report.location?.name || '',
          coords: {
            lat: report.location?.latitude,
            lng: report.location?.longitude
          },
          email: report.reported_by?.email || null
        };
        setTimeout(() => this.initMap(), 0);
      },
      error: err => {
        console.error('Не вдалося отримати звіт:', err);
        this.goBack();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.reportData.coords || !(window as any).google?.maps) return;

    const map = new google.maps.Map(this.mapElement.nativeElement, {
      center: this.reportData.coords,
      zoom: 16
    });

    new google.maps.Marker({
      position: this.reportData.coords,
      map
    });
  }

  initMap(): void {
    if (!this.reportData?.coords || !(window as any).google?.maps) return;

    const map = new google.maps.Map(this.mapElement.nativeElement, {
      center: this.reportData.coords,
      zoom: 16
    });

    new google.maps.Marker({
      position: this.reportData.coords,
      map
    });

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: this.reportData.coords }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        this.reportData.address = results[0].formatted_address;
        this.cdr.detectChanges();
      } else {
        this.reportData.address = 'Адресу не знайдено';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/animal/user-profile'], {
      state: { newAnimal: this.animals[this.animals.length - 1] }
    });
  }

  accept(): void {
    this.animalService.assignToReport(this.reportData.id).subscribe({
      next: () => {
        const animalId = this.reportData.animalId || this.reportData.id;

        this.animalService.getAnimalById(animalId).subscribe({
          next: (animal: any) => {
            const animalToPush = {
              id: animal.id,
              name: animal.name,
              image: animal.media?.[0]?.url || 'assets/img/animal-default.jpg'
            };
            this.animals.push(animalToPush);
            const fullReport = {
              ...this.reportData,
              animal: animal
            };
            this.router.navigate(['/animal/user-profile'], {
              state: {
              newAnimal: animalToPush,
              fullReport
            }
          });
          localStorage.setItem('last_full_report', JSON.stringify(fullReport));
          },
          error: err => {
            console.error('Не вдалося отримати дані тварини:', err);
          }
        });
      },
      error: err => {
        console.error('Помилка підтвердження тварини:', err);
      }
    });
  }

  reject(): void {
    this.messages = this.messages.filter(msg => msg.id !== this.reportData.id);
    this.goBack();
  }
}
