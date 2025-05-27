/// <reference types="@types/google.maps" />

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { takeUntil, switchMap, filter, take } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  reportId: number | null = null;
  private destroy$ = new Subject<void>();
  apiUrl = 'https://kkp-api.ruslan.page/api';

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(private router: Router, private http: HttpClient) {
    const nav = this.router.getCurrentNavigation();
    this.reportId = nav?.extras?.state?.['reportId'] ?? null;
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

    interval(5000).pipe(
      takeUntil(this.destroy$),
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/animal-reports/${this.reportId}`, {
          headers: { 'x-token': localStorage.getItem('access_token') || '' }
        })
      ),
      filter(response => {
        console.log('[DEBUG] Перевірка статусу:', response.assigned_to);
        return !!response.assigned_to}),
      take(1)
      ).subscribe(() => {
        this.router.navigate(['/animal/volunteer-waiting'], { state: { reportId: this.reportId } });
      });
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

          const placesService = new google.maps.places.PlacesService(this.map);
          const distanceService = new google.maps.DistanceMatrixService();

          placesService.nearbySearch(
            {
              location: userCoords,
              radius: 100000,
              keyword: 'ветеринарна клініка'
            },
            (results: any, status: any) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                results.forEach((place: any) => {
                  if (place.geometry?.location) {
                    const destination = place.geometry.location;

                    const marker = new google.maps.Marker({
                      map: this.map,
                      position: destination
                    });

                    // Отримати пішу відстань
                    distanceService.getDistanceMatrix({
                      origins: [userCoords],
                      destinations: [destination],
                      travelMode: google.maps.TravelMode.WALKING
                    }, (walkRes: any, walkStatus: any) => {
                      if (walkStatus === 'OK') {
                        const walkTime = walkRes.rows[0].elements[0].duration.text;

                        // Отримати автомобільну відстань
                        distanceService.getDistanceMatrix({
                          origins: [userCoords],
                          destinations: [destination],
                          travelMode: google.maps.TravelMode.DRIVING
                        }, (driveRes: any, driveStatus: any) => {
                          if (driveStatus === 'OK') {
                            const driveTime = driveRes.rows[0].elements[0].duration.text;


                            const infoWindow = new google.maps.InfoWindow({
                              content: `
                                <div style="font-size: 14px; color: #000; min-width: 280px; padding: 5px 6px;">
                                  <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">
                                    ${place.name}
                                  </div>
                                  <div style="color: #555;">${place.vicinity || 'Адресу не знайдено'}</div>
                                  <div style="margin-bottom: 15px; font-size: 13px;">
                                    🚶 ${walkTime} пішки <br/> 🚗 ${driveTime} машиною
                                  </div>
                                </div>`
                            });

                            marker.addListener('click', () => {
                              infoWindow.open(this.map, marker);
                            });
                          }
                        });
                      }
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

  goToThankYou(): void {
    this.router.navigate(['/animal/thank-you'], { queryParams: { method: 'self' } });
  }
}
