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
  isAuthenticated = false;
  menuOpen = false;

  constructor() {
    const token = localStorage.getItem('access_token');
    this.isAuthenticated = !!token;
  }

  ngOnInit(): void {
    window.addEventListener('storage', () => {
      const token = localStorage.getItem('access_token');
      this.isAuthenticated = !!token;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.isAuthenticated = false;
    window.location.reload();
  }
}

