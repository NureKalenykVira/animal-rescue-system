/// <reference types="@types/google.maps" />

import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DonationService, Donation } from '../../services/donation.service';
import { HttpClient } from '@angular/common/http';

declare const google: any;
declare const paypal: any;

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
export class DonationPaymentComponent implements OnInit, AfterViewInit {
  @ViewChild('addressInput') addressInput!: ElementRef;

  showDialog = false;
  donationId!: number;
  donation!: Donation;

  donationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private donationService: DonationService,
    private http: HttpClient
  ) {
    this.donationForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      cardName: ['', Validators.required],
      address: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      comment: [''],
      anonymous: [false]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.donationId = +idParam;
      this.donationService.getDonationById(this.donationId).subscribe(data => {
        this.donation = data;
      });
    }
  }

  ngAfterViewInit(): void {
    // Google Maps Autocomplete
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

    // PayPal Smart Button
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
      paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        style: {
          layout: 'vertical',
          label: 'paypal',
          color: 'gold',
          shape: 'rect'
        },
        funding: {
          disallow: [paypal.FUNDING.CARD]
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: (this.donationForm.get('amount')?.value || 1).toFixed(2),
                currency_code: 'USD'
              },
              description: this.donation?.name || 'Благодійний донат'
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            console.log('Оплата успішна. Донат:', details);

            this.showDialog = true;

            const payload = {
              ...this.donationForm.value,
              paypalOrderId: data.orderID,
              email: details.payer.email_address,
              name: details.payer.name?.given_name
            };

            this.http.post(`https://kkp-api.ruslan.page/api/donations/${this.donationId}/donate`, payload).subscribe();
          });
        },
        onError: (err: any) => {
          console.error('Помилка PayPal:', err);
          alert('Помилка при оплаті через PayPal');
        }
      }).render('#paypal-button-container');
    }
  }

  submitDonation(): void {
    if (this.donationForm.valid) {
      const payload = {
        ...this.donationForm.value
      };

      this.http.post(`https://kkp-api.ruslan.page/api/donations/${this.donationId}/donate`, payload).subscribe({
        next: () => this.showDialog = true,
        error: err => {
          console.error('Donation failed:', err);
          alert('Помилка при надсиланні донату. Спробуйте ще раз.');
        }
      });
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
