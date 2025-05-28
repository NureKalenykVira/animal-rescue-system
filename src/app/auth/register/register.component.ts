import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NgIf]
})
export class RegisterComponent {
  registerForm: FormGroup;
  modalMessage: string | null = null;
  isModalVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
  if (this.registerForm.valid) {
    const { email, password, fullName } = this.registerForm.value;
    const [first_name, last_name] = fullName.split(' ');
    const payload = {
      email,
      password,
      first_name: first_name || 'Імʼя',
      last_name: last_name || 'Прізвище',
      role: 0
    };

    this.authService.register(payload).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: (err: any) => this.showModal('Помилка реєстрації: ' + (err.error?.detail || 'Невірні дані'))
    });
  } else {
    this.registerForm.markAllAsTouched();
  }
}

loginWithGoogle(): void {
  this.authService.getGoogleAuthUrl().subscribe({
    next: (res) => {
      window.location.href = res.url;
    },
    error: () => this.showModal('Не вдалося отримати Google URL')
  });
}

  goBack(): void {
    this.router.navigate(['/home']);
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
