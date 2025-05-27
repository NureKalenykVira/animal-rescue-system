import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: '<p>Завершується авторизація Google...</p>'
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('GoogleCallbackComponent loaded');

    let code = this.route.snapshot.queryParamMap.get('code');

    if (code) {
      code = decodeURIComponent(code);
      console.log('Decoded code:', code);

      this.authService.handleGoogleCallback({ code }).subscribe({
        next: (res) => {
          const token = res.access_token || res.token;
          if (token) {
            localStorage.setItem('access_token', token.replace(/^Bearer\s+/i, ''));
          } else {
            alert('Не вдалося отримати токен після входу через Google');
            this.router.navigate(['/auth/login']);
            return;
          }

          this.authService.getUserInfo().subscribe({
            next: (user) => {
              const roleCode = user.role;
              const role = this.getRoleFromCode(roleCode);
              const isAdmin = [100, 999, 777].includes(roleCode);

              localStorage.setItem('role', role);
              localStorage.setItem('isAdmin', String(isAdmin));

              this.router.navigate(['/animal']);
            },
            error: () => {
              alert('Вхід виконано, але не вдалося отримати дані користувача');
              this.router.navigate(['/auth/login']);
            }
          });
        },
        error: () => {
          alert('Не вдалося завершити авторизацію Google');
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private getRoleFromCode(code: number): 'user' | 'volunteer' | 'vet' {
    if (code === 0) return 'user';
    if (code === 10) return 'volunteer';
    if (code === 11) return 'vet';
    return 'user';
  }
}
