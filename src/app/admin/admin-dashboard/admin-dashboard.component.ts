import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // шлях адаптуй

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (res) => this.user = res,
      error: () => this.user = null
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  get isLocalAdmin(): boolean {
    return localStorage.getItem('role') === 'LocalAdmin';
  }
}
