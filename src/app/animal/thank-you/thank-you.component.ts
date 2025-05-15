/// <reference types="@types/google.maps" />

import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';

declare global {
  interface Window {
    initMap: () => void;
  }
}
declare const google: any;

@Component({
  selector: 'app-thank-you',
  imports: [NgIf],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit, AfterViewInit {
  method: string | null = null;

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  userCoords: google.maps.LatLngLiteral | null = null;
  clinics: google.maps.places.PlaceResult[] = [];
  directionsRenderer!: google.maps.DirectionsRenderer;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.method = params.get('method');
    });
  }

  ngAfterViewInit(): void {
    if (this.method !== 'self') return;

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
    const defaultCenter = { lat: 48.3794, lng: 31.1656 };

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: 6
    });

    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          this.map.setCenter(this.userCoords);
          this.map.setZoom(10);

          new google.maps.Marker({
            position: this.userCoords,
            map: this.map,
            title: 'Ваше місцезнаходження',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });

          const service = new google.maps.places.PlacesService(this.map);
          service.nearbySearch(
            {
              location: this.userCoords,
              radius: 100000,
              keyword: 'ветеринарна клініка'
            },
            (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                this.clinics = results;

                results.forEach((place: any) => {
                  if (place.geometry?.location) {
                    const marker = new google.maps.Marker({
                      map: this.map,
                      position: place.geometry.location,
                      title: place.name
                    });

                    marker.addListener('click', () => {
                      this.buildRoute(place.geometry.location);
                     });
                  }
                });
              }
            }
          );
        },
        () => {
          console.warn('Геолокацію не дозволено.');
        }
      );
    }
  }

  buildRoute(destinationRaw: google.maps.LatLng | google.maps.LatLngLiteral) {
  if (!this.userCoords || !destinationRaw) return;

  const destination: google.maps.LatLngLiteral = {
    lat: (destinationRaw as google.maps.LatLng).lat
      ? (destinationRaw as google.maps.LatLng).lat()
      : (destinationRaw as google.maps.LatLngLiteral).lat,
    lng: (destinationRaw as google.maps.LatLng).lng
      ? (destinationRaw as google.maps.LatLng).lng()
      : (destinationRaw as google.maps.LatLngLiteral).lng
  };

  const directionsService = new google.maps.DirectionsService();

  directionsService.route(
    {
      origin: this.userCoords,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    },
    (response: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(response);
      } else {
        alert('Не вдалося побудувати маршрут');
      }
    }
  );
}
}
