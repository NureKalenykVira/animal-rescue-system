import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, NgIf, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  resetError: string | null = null;
  resetToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeat_password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['reset_token'];
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      const { password, repeat_password } = this.resetForm.value;
      this.authService.resetPassword({ reset_token: this.resetToken || '', new_password: password }).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          const errorMessage = (err?.error?.errors?.[0] || '').toLowerCase();

          if (errorMessage.includes('not found')) {
            this.resetError = 'Невірний email або пароль';
          } else if (errorMessage.includes('inactive')) {
            this.resetError = 'Обліковий запис не активовано';
          } else {
            this.resetError = 'Сталася помилка при вході. Спробуйте ще раз';
          }

          console.warn('[DEBUG] Server error:', err.error);
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
