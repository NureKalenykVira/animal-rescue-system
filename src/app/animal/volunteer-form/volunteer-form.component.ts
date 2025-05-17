import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private router: Router) {
    this.volunteerForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+380\d{9}$/)]],
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
      this.showDialog = true;
      // TODO: Надіслати на бекенд, коли буде готовий
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
}
