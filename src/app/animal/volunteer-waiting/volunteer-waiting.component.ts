import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-volunteer-waiting',
  templateUrl: './volunteer-waiting.component.html',
  styleUrl: './volunteer-waiting.component.scss',
  standalone: true,
  imports: []
})
export class VolunteerWaitingComponent implements OnInit {
  reportId: number | null = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';
  volunteer = {
    name: '',
    phone: '',
    telegram: '',
    whatsapp: ''
  };

  constructor(private router: Router, private http: HttpClient) {
    const nav = this.router.getCurrentNavigation();
    this.reportId = nav?.extras?.state?.['reportId'] ?? null;
  }

  ngOnInit(): void {
    if (!this.reportId) return;

    this.http.get<any>(`${this.apiUrl}/animal-reports/${this.reportId}`, {
      headers: { 'x-token': localStorage.getItem('access_token') || '' }
    }).subscribe({
      next: (res) => {
        const v = res.assigned_to;

        if (!v) {
          console.warn('Волонтер ще не призначений (assigned_to == null)');
          return;
        }

        this.volunteer = {
          name: `${v.first_name} ${v.last_name}`,
          phone: v.viber_phone || v.whatsapp_phone || 'Номер не вказано',
          telegram: v.telegram_username || 'Не вказано',
          whatsapp: v.whatsapp_phone || 'Не вказано'
        };
      },
      error: err => {
        console.error('Не вдалося завантажити волонтера:', err);
      }
    });
  }

  goTo(): void {
    this.router.navigate(['/animal/thank-you']);
  }
}
