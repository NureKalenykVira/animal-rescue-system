/// <reference types="@types/google.maps" />

import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DonationService, Goal } from '../../services/donation.service';
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
  goal!: Goal;
  goalId!: number;
  createdDonationId!: number;
  modalMessage: string | null = null;
  isModalVisible = false;

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
      this.goalId = +idParam;
      this.donationService.getDonationById(this.goalId).subscribe(data => {
        this.goal = data;
      });
    }
  }

  ngAfterViewInit(): void {
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
        createOrder: () => {
          const token = localStorage.getItem('access_token') || '';
          return this.donationService
            .createPaypalOrder(this.goalId, this.donationForm.value, token)
            .then(paypalId => {
              this.createdDonationId = this.donationService.getLastDonationId();
              return paypalId;
            });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            const payload = {
              paypalOrderId: data.orderID,
              email: details.payer.email_address,
              name: details.payer.name?.given_name
            };

            this.donationService
              .confirmPaypalDonation(this.goalId, this.createdDonationId, payload)
              .subscribe({
                next: () => {
                  this.showDialog = true;
                },
                error: () => {
                  this.showModal('Обробка платежу не вдалася');
                }
            });
          });
        },
        onError: () => {
          this.showModal('Помилка при оплаті через PayPal');
        }
      }).render('#paypal-button-container');
    }
  }

  submitDonation(): void {
    if (this.donationForm.valid) {
      const payload = {
        ...this.donationForm.value
      };

      this.http.post<any>(
        `https://kkp-api.ruslan.page/api/donations/${this.goalId}/donate`,
        payload
      ).subscribe({
        next: () => {
          this.showDialog = true;
        },
        error: err => {
          console.error('Помилка створення донату (форма):', err);
          this.showModal('Помилка при надсиланні донату. Спробуйте ще раз.');
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

  showModal(message: string): void {
    this.modalMessage = message;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.modalMessage = null;
  }
}
