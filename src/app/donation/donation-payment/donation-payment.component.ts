/// <reference types="@types/google.maps" />

import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-donation-payment',
  standalone: true,
  templateUrl: './donation-payment.component.html',
  styleUrls: ['./donation-payment.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ]
})
export class DonationPaymentComponent implements AfterViewInit {
  @ViewChild('addressInput') addressInput!: ElementRef;

  showDialog = false;

  donation = {
    title: 'Допомога постраждалим тваринам',
    description: 'Цей збір спрямовано на лікування та тимчасове утримання тварин, що постраждали через обстріли.',
    imageUrl: '/assets/img/raccoon.jpg'
  };

  donationForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.donationForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      cardName: ['', Validators.required],
      address: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiry: [ '', [ Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/) ]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      comment: [''],
      anonymous: [false]
    });
  }

  ngAfterViewInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const input = document.getElementById('autocomplete') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['geocode'],
      componentRestrictions: { country: 'ua' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const fullAddress = place.formatted_address || place.name;
      this.donationForm.get('address')?.setValue(fullAddress);
    });
  }

  submitDonation(): void {
    if (this.donationForm.valid) {
      console.log('Donation form data:', this.donationForm.value);
      this.showDialog = true;
    } else {
      this.donationForm.markAllAsTouched();
    }
  }

  closeDialog(): void {
    this.router.navigate(['/donation/donation-list']);
  }

  goBack(): void {
    this.router.navigate(['/donation/donation-list']);
  }
}
