/// <reference types="@types/google.maps" />

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

declare global {
  interface Window {
    initMap: () => void;
  }
}
declare const google: any;

@Component({
  selector: 'app-volunteer-search',
  templateUrl: './volunteer-search.component.html',
  styleUrls: ['./volunteer-search.component.scss']
})
export class VolunteerSearchComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
  const checkIfGoogleLoaded = () => {
    if ((window as any).google && (window as any).google.maps) {
      this.initMap();
    } else {
      setTimeout(checkIfGoogleLoaded, 100);
    }
  };
  checkIfGoogleLoaded();

  setTimeout(() => {
    this.router.navigate(['/animal/volunteer-waiting']);
  }, 30000);
}

  initMap(): void {
    const defaultCenter = { lat: 48.3794, lng: 31.1656 };

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: 6
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.map.setCenter(userCoords);
          this.map.setZoom(10);

          const service = new google.maps.places.PlacesService(this.map);
          service.nearbySearch(
            {
              location: userCoords,
              radius: 100000,
              keyword: 'ветеринарна клініка'
            },
            (results: any, status: any) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                results.forEach((place: any) => {
                  if (place.geometry?.location) {
                    new google.maps.Marker({
                      map: this.map,
                      position: place.geometry.location
                    });
                  }
                });
              }
            }
          );
        },
        () => {
          // fallback
          console.warn('Геолокацію не дозволено.');
        }
      );
    }
  }

  goToThankYou(): void {
    this.router.navigate(['/animal/thank-you'], { queryParams: { method: 'self' } });
  }
}
