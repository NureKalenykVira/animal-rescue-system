import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-volunteer-form',
  templateUrl: './volunteer-form.component.html',
  styleUrls: ['./volunteer-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterModule]
})
export class VolunteerFormComponent {
  volunteerForm: FormGroup;
  showDialog = false;
  modalMessage: string | null = null;
  isModalVisible = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.volunteerForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+380\d{9}$/)]],
      telegram: [''],
      viber: [''],
      whatsapp: [''],
      location: ['', Validators.required],
      hasTransport: ['', Validators.required],
      helpTypes: [[], Validators.required],
      availability: [[], Validators.required],
      experience: [''],
      consent: [false, Validators.requiredTrue]
    });
  }

  onHelpTypeChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const selectedHelpTypes = this.volunteerForm.get('helpTypes')?.value || [];

    if (checkbox.checked) {
      selectedHelpTypes.push(checkbox.value);
    } else {
      const index = selectedHelpTypes.indexOf(checkbox.value);
      if (index > -1) {
        selectedHelpTypes.splice(index, 1);
      }
    }

    this.volunteerForm.get('helpTypes')?.setValue(selectedHelpTypes);
    this.volunteerForm.get('helpTypes')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.volunteerForm.valid) {
      const availabilityLabels: string[] = this.volunteerForm.get('availability')?.value || [];
      let availability = 0;
      if (availabilityLabels.includes('У будні')) availability |= 1;
      if (availabilityLabels.includes('У вихідні')) availability |= 2;
      if (availabilityLabels.includes('У будь-який час')) availability = 1 | 2;

      const helpLabels: string[] = this.volunteerForm.get('helpTypes')?.value || [];
      let help = 0;
      const helpMap: { [label: string]: number } = {
        'Тимчасове прихистування тварин': 1,
        'Доставка до клініки': 2,
        'Виїзд на місце знаходження тварини': 4,
        'Медичний догляд / після лікування': 8,
        'Інформаційна підтримка / соцмережі': 16
      };
      for (const label of helpLabels) {
        help |= helpMap[label] || 0;
      }

      const payload = {
        full_name: this.volunteerForm.get('fullName')?.value,
        phone_number: this.volunteerForm.get('phone')?.value,
        city: this.volunteerForm.get('location')?.value,
        has_vehicle: this.volunteerForm.get('hasTransport')?.value === 'yes',
        availability,
        help,
        text: this.volunteerForm.get('experience')?.value || '',
        telegram_username: this.volunteerForm.get('telegram')?.value || '',
        viber_phone: this.volunteerForm.get('viber')?.value || '',
        whatsapp_phone: this.volunteerForm.get('whatsapp')?.value || '',
        media_ids: []
      };

      fetch('https://kkp-api.ruslan.page/api/volunteer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': localStorage.getItem('access_token') || ''
        },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Помилка запиту');
          return res.json();
        })
        .then(() => {
          this.showDialog = true;
        })
        .catch(err => {
          console.error('Помилка відправки анкети:', err);
          this.showModal('Не вдалося надіслати анкету. Спробуйте пізніше.');
        });

    } else {
      this.volunteerForm.markAllAsTouched();
    }
  }

  redirectToProfile(): void {
    this.router.navigate(['/animal/user-profile']);
  }

  ngAfterViewInit(): void {
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['(cities)'],
      componentRestrictions: { country: 'ua' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const cityName = place.name;
      this.volunteerForm.get('location')?.setValue(cityName);
    });
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
