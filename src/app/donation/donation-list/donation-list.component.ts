import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-donation-list',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, SiteFooterComponent, RouterModule ],
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.scss']
})
export class DonationListComponent {
  constructor(private router: Router) {}

  donations = [
  { id: 1, title: 'Назва збору 1', description: 'Опис ......' },
  { id: 2, title: 'Назва збору 2', description: 'Опис ......' },
  { id: 3, title: 'Назва збору 3', description: 'Опис ......' },
  { id: 4, title: 'Назва збору 4', description: 'Опис ......' },
  { id: 5, title: 'Назва збору 5', description: 'Опис ......' },
];

  goToPayment(donationId: number): void {
    this.router.navigate(['/donation/donation-payment', donationId]);
  }
}
