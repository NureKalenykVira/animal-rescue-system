/// <reference types="@types/google.maps" />

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-animal-notification',
  standalone: true,
  templateUrl: './animal-notification.component.html',
  styleUrls: ['./animal-notification.component.scss'],
  imports: [NgIf, RouterModule],
})
export class AnimalNotificationComponent implements AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;

  // Мокові дані (можна замінити на API у майбутньому)
  reportData = {
    id: 999,
    name: 'Лисиця',
    type: 'Дика тварина',
    gender: 'дівчина',
    notes: 'Тварину помічено неподалік узбіччя дороги в лісистій місцевості. Вона кульгає на передню лапу та майже не реагує на наближення людей, що свідчить про можливий сильний біль або шоковий стан. Біля неї видно сліди боротьби або травмування. Ймовірно, тварина потрапила під авто або заплуталась у сітці.',
    photoUrl: '/assets/img/fox.jpg',
    address: 'вул. Троїцька, 15, Одеса',
    coords: { lat: 46.4775, lng: 30.7326 },
    email: 'reporter@example.com'
  };

  messages: { id: number; title: string }[] = [
    { id: 999, title: 'Нова тварина' }
  ];

  animals: { id: number; name: string; image: string }[] = [];

  constructor(private router: Router) {}

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

  goBack(): void {
    this.router.navigate(['/animal/user-profile']);
  }

  accept(): void {
    this.animals.push({
      id: this.reportData.id,
      name: this.reportData.name,
      image: this.reportData.photoUrl
    });

    this.messages = this.messages.filter(msg => msg.id !== this.reportData.id);
    this.goBack();
  }

  reject(): void {
    this.messages = this.messages.filter(msg => msg.id !== this.reportData.id);
    this.goBack();
  }
}
