import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-site-header',
  imports: [NgIf, RouterModule],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss'
})
export class SiteHeaderComponent {
  isAuthenticated = true;

  constructor() {
    // тимчасова логіка:
    const token = localStorage.getItem('access_token');
    this.isAuthenticated = !token;
  }

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
