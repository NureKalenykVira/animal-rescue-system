/// <reference types="@types/google.maps" />

import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [NgIf],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit, AfterViewInit {
  method: string | null = null;
  selectedClinicCoords: google.maps.LatLngLiteral | null = null;
  modalMessage: string | null = null;
  isModalVisible = false;

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  userCoords: google.maps.LatLngLiteral | null = null;
  directionsRenderer!: google.maps.DirectionsRenderer;

  constructor(private route: ActivatedRoute, private router: Router) {}

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

          const placesService = new google.maps.places.PlacesService(this.map);
          const distanceService = new google.maps.DistanceMatrixService();

          placesService.nearbySearch(
            {
              location: this.userCoords,
              radius: 100000,
              keyword: 'ветеринарна клініка'
            },
            (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                results.forEach((place: any) => {
                  if (!place.geometry?.location) return;

                  const destination = place.geometry.location;

                  const marker = new google.maps.Marker({
                    map: this.map,
                    position: destination,
                    title: place.name
                  });

                  // Пішки
                  distanceService.getDistanceMatrix({
                    origins: [this.userCoords!],
                    destinations: [destination],
                    travelMode: google.maps.TravelMode.WALKING
                  }, (walkRes, walkStatus) => {
                    if (walkStatus !== 'OK' || !walkRes) return;
                    const walkTime = walkRes.rows[0].elements[0].duration.text;

                    // Машиною
                    distanceService.getDistanceMatrix({
                      origins: [this.userCoords!],
                      destinations: [destination],
                      travelMode: google.maps.TravelMode.DRIVING
                    }, (driveRes, driveStatus) => {
                      if (driveStatus !== 'OK' || !driveRes) return;
                      const driveTime = driveRes.rows[0].elements[0].duration.text;

                      const infoWindow = new google.maps.InfoWindow({
                        content: `
                          <div style="font-size: 14px; color: #000; min-width: 240px; padding: 6px;">
                            <div style="font-weight: bold; font-size: 15px;">${place.name}</div>
                            <div style="color: #555; margin-bottom: 6px;">${place.vicinity || 'Адресу не знайдено'}</div>
                            <div style="font-size: 13px; margin-bottom: 8px;">
                              🚶 ${walkTime} пішки<br/>
                              🚗 ${driveTime} машиною
                            </div>
                            <button id="choose-btn" style="
                              background-color: #006c59;
                              color: white;
                              border: none;
                              padding: 6px 12px;
                              border-radius: 4px;
                              cursor: pointer;
                            ">
                              Обрати
                            </button>
                          </div>
                        `
                      });

                      marker.addListener('click', () => {
                        infoWindow.open(this.map, marker);

                        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
                          const btn = document.getElementById('choose-btn');
                          if (btn) {
                            btn.addEventListener('click', () => {
                              this.buildRoute(destination);
                              infoWindow.close();
                            });
                          }
                        });
                      });
                    });
                  });
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

  buildRoute(destinationRaw: google.maps.LatLng | google.maps.LatLngLiteral): void {
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
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);
          this.selectedClinicCoords = destination;
        } else {
          this.showModal('Не вдалося побудувати маршрут');
        }
      }
    );
  }

  openInGoogleMaps(): void {
    if (!this.userCoords || !this.selectedClinicCoords) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.userCoords.lat},${this.userCoords.lng}&destination=${this.selectedClinicCoords.lat},${this.selectedClinicCoords.lng}&travelmode=driving`;
    window.open(url, '_blank');
  }

  goTo(): void {
    this.router.navigate(['/home']);
  }

  showModal(message: string): void {
    this.modalMessage = message;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.modalMessage = null;
  }
}
