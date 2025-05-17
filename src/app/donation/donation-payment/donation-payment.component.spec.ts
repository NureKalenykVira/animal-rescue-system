import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationPaymentComponent } from './donation-payment.component';

describe('DonationPaymentComponent', () => {
  let component: DonationPaymentComponent;
  let fixture: ComponentFixture<DonationPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
