import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';

declare const google: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgFor,
    SiteHeaderComponent,
    SiteFooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  adoptedAnimals: any[] = [];

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;

  ngOnInit(): void {
    // Прикладові дані (надалі буде з бекенду)
    this.adoptedAnimals = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Тварина ${i + 1}`,
      photoUrl: 'assets/img/animal-default.jpg',
      status: 'усиновлений'
    }));
  }

  ngAfterViewInit(): void {
    if (!(window as any).google || !(window as any).google.maps) return;

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 48.3794, lng: 31.1656 },
      zoom: 6
    });

    navigator.geolocation?.getCurrentPosition((pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      this.map.setCenter(coords);
      this.map.setZoom(10);
      new google.maps.Marker({
        position: coords,
        map: this.map,
        title: 'Ваше місцезнаходження',
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
      });

      const service = new google.maps.places.PlacesService(this.map);
      service.nearbySearch(
        { location: coords, radius: 100000, keyword: 'ветеринарна клініка' },
        (results: any, status: any) => {
          if (status === 'OK') {
            results.forEach((place: any) => {
              new google.maps.Marker({
                map: this.map,
                position: place.geometry.location,
                title: place.name
              });
            });
          }
        }
      );
    });
  }
}
