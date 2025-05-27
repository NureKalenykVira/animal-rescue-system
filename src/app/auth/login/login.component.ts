import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, FormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (res) => {
          if (res && res.access_token) {
            localStorage.setItem('access_token', res.access_token);
          }
          this.authService.getUserInfo().subscribe({
            next: (user) => {
              const roleCode = user.role;
              const role = this.getRoleFromCode(roleCode);
              const isAdmin = [100, 999, 777].includes(roleCode);

              localStorage.setItem('role', role);
              localStorage.setItem('isAdmin', String(isAdmin));

              this.router.navigate([isAdmin ? '/admin' : '/animal']);
            },
            error: () => {
              alert('Не вдалося отримати дані користувача після входу');
            }
          });
        },
        error: (err) => {
          const errorMessage = (err?.error?.errors?.[0] || '').toLowerCase();

          if (errorMessage.includes('not found')) {
            this.loginError = 'Невірний email або пароль';
          } else if (errorMessage.includes('inactive')) {
            this.loginError = 'Обліковий запис не активовано';
          } else {
            this.loginError = 'Сталася помилка при вході. Спробуйте ще раз';
          }

          console.warn('[DEBUG] Server error:', err.error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  showForgotModal = false;
  showResetModal = false;

  resetEmail = '';
  resetToken = '';
  newPassword = '';
  confirmPassword = '';
  resetError: string | null = null;

  requestReset(): void {
    this.authService.requestPasswordReset({ email: this.resetEmail }).subscribe({
      next: () => {
        alert('Лист надіслано. Перевірте пошту або введіть токен вручну.');
        this.showForgotModal = false;
        this.showResetModal = true;
      },
      error: () => this.resetError = 'Не вдалося надіслати листа'
    });
  }

  submitNewPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.resetError = 'Паролі не збігаються';
      return;
    }

    this.authService.resetPassword({
      reset_token: this.resetToken,
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        alert('Пароль оновлено');
        this.showResetModal = false;
      },
      error: () => this.resetError = 'Невірний токен або помилка'
    });
  }

  getRoleFromCode(roleCode: number): 'user' | 'volunteer' | 'vet' {
    if (roleCode === 0) return 'user';
    if (roleCode === 10) return 'volunteer';
    if (roleCode === 11) return 'vet';
    return 'user';
  }

  loginWithGoogle(): void {
    this.authService.getGoogleAuthUrl().subscribe({
      next: (res) => {
        window.location.href = res.url; // Редирект
      },
      error: () => alert('Не вдалося отримати Google URL')
    });
  }
}
