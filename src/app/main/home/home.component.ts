import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const params = new HttpParams()
      .set('status', '5')
      .set('page', '1')
      .set('page_size', '5')
      .set('order_by', 'updated_at')
      .set('order', 'desc');

    const token = localStorage.getItem('access_token');
    const headers = token
      ? new HttpHeaders({
          'x-token': token
      })
      : undefined;

    this.http.get<any>('https://kkp-api.ruslan.page/api/animals', { params, headers }).subscribe({
      next: (res) => {
        this.adoptedAnimals = res.result.map((animal: any) => ({
          id: animal.id,
          name: animal.name,
          photoUrl: animal.media?.result?.[0]?.url || 'assets/img/animal-default.jpg',
          status: 'усиновлений'
        }));
      },
      error: (err) => {
        console.error('Помилка отримання усиновлених тварин:', err);
      }
    });
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
