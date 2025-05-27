import { CommonModule } from '@angular/common';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { RouterModule, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DonationService, Donation } from '../../services/donation.service';

@Component({
  selector: 'app-donation-list',
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.scss'],
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, SiteFooterComponent, RouterModule],
})
export class DonationListComponent implements OnInit {
  donations: Donation[] = [];
  expandedDonationId: number | null = null;
  donationDetailsCache: { [id: number]: Donation } = {};

  constructor(private donationService: DonationService, private router: Router) {}

  ngOnInit(): void {
    this.donationService.getDonations().subscribe(data => {
      this.donations = data.result;
    });
  }

  toggleDetails(donationId: number): void {
    if (this.expandedDonationId === donationId) {
      this.expandedDonationId = null;
      return;
    }

    this.expandedDonationId = donationId;
    if (!this.donationDetailsCache[donationId]) {
      this.donationService.getDonationById(donationId).subscribe(data => {
        this.donationDetailsCache[donationId] = data;
      });
    }
  }

  getFormattedDate(timestamp: number | string | null): string {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : +timestamp);
    return date.toLocaleString('uk-UA', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }


  goToPayment(donationId: number): void {
    this.router.navigate(['/donation/donation-payment', donationId]);
  }
}
