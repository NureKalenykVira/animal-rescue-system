import { Component } from '@angular/core';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  role: 'user' | 'volunteer' | 'vet' = 'volunteer';
  isEditing = false;

  originalPassword = '';
  showPasswordChange = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Початкові дані користувача
  user = {
    name: 'Emma Smith',
    username: '@emma_smith',
    email: 'emmasmith@gmail.com',
    password: 'password',
    photoUrl: ''
  };

  // Reactive Form
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required]],
      email: [this.user.email, [Validators.required, Validators.email]],
      password: [this.user.password, [Validators.required, Validators.minLength(6)]]
    });
    this.profileForm.disable();
  }

  get name() {
    return this.profileForm.get('name')!;
  }

  get email() {
    return this.profileForm.get('email')!;
  }

  get password() {
    return this.profileForm.get('password')!;
  }

  startEdit(): void {
    this.isEditing = true;
    this.originalPassword = this.password.value;
    this.profileForm.enable();
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (this.password.value !== this.originalPassword) {
      this.showPasswordChange = true;
      return;
    }
    this.commitSave();
  }

  commitSave(): void {
    this.isEditing = false;
    this.profileForm.disable();

    this.user.name = this.name.value;
    this.user.email = this.email.value;
    this.user.password = this.password.value;
  }

  passwordError: 'old' | 'short' | 'mismatch' | null = null;

submitPasswordChange(): void {
  this.passwordError = null;

  if (!this.oldPassword || !this.newPassword || !this.confirmPassword) return;

  if (this.oldPassword !== this.originalPassword) {
    this.passwordError = 'old';
    return;
  }

  if (this.newPassword.length < 6) {
    this.passwordError = 'short';
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.passwordError = 'mismatch';
    return;
  }

  this.profileForm.patchValue({ password: this.newPassword });
  this.password.markAsTouched();
  this.password.updateValueAndValidity();

  if (this.profileForm.invalid) return;

  this.showPasswordChange = false;
  this.commitSave();
}

  animals = [
    { id: 1, name: 'Киця', image: '' },
  { id: 2, name: 'Песик', image: '' },
  { id: 3, name: 'Лисиця', image: '' },
  { id: 4, name: 'Білка', image: '' },
  { id: 5, name: 'Їжачок', image: '' },
  { id: 4, name: 'Оленя', image: '' },
  { id: 5, name: 'Качка', image: '' },
  ];

  // Повідомлення
  messages = [
  {
    id: 1,
    title: 'Нову тварину (Лисиця) знайдено! Вона потребує твоєї допомоги',
    date: '1 березня 2023 о 14:00',
    type: 'new'
  },
  {
    id: 2,
    title: 'Оновлення по тварині (Собака): додано нову інформацію',
    date: '3 березня 2023 о 09:30',
    type: 'update',
    animalId: 2
  }
];

openAnimalForm(msg: any) {
  if (msg.type === 'new') {
    this.router.navigate(['animal/animal-notification', msg.animalId]);
    console.log('Відкрити форму для нової тварини');
  } else if (msg.type === 'update') {
    this.router.navigate(['/animals', msg.animalId]);
  }
}

acceptAnimal(msg: any) {
  this.animals.unshift({
    id: Date.now(),
    name: 'Лисиця',
    image: 'https://source.unsplash.com/300x200/?fox',
  });
  this.messages = this.messages.filter(m => m !== msg);
}

rejectMessage(msg: any) {
  this.messages = this.messages.filter(m => m !== msg);
}
}
