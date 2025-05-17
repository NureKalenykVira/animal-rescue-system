import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-animal-profile',
  standalone: true,
  imports: [
    CommonModule,
    SiteHeaderComponent,
    SiteFooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './animal-profile.component.html',
  styleUrl: './animal-profile.component.scss'
})
export class AnimalProfileComponent {

  // 🔹 Для всіх
  animalId!: number;
  isAuthenticated = true; // TODO: замінити на реальну перевірку
  isEditing = false;
  isFollowing = false;
  role: 'user' | 'volunteer' | 'vet' = 'user';

  statusLabels: { [key: number]: string } = {
    0: 'Новоприбулий',
    1: 'На лікуванні',
    2: 'Здоровий',
    3: 'Усиновлений'
  };

  animal = {
    name: 'Жучка',
    breed: 'Лабрадор ретривер',
    gender: 'Дівчинка',
    foundDate: '2025-03-05',
    location: 'с. Новосілки, біля озера',
    status: 2,
    description: 'Добра і спокійна собака, трохи ляклива, але йде на контакт з людьми.',
    center: 'Центр порятунку тварин “Добродій”',
    photoUrl: 'assets/img/deer.jpg',
    qrCodeUrl: ' ',
    vetClinic: {
      name: 'ВетСервіс+',
      address: 'м. Київ, просп. Перемоги, 123',
      phone: '+380991112233'
    },
    responsibleUser: {
      name: 'Ігор Пшеничний',
      role: 'ветеринар',
      phone: '+380671234567'
    },
    responsibleVolunteer: {
      name: 'Олена Лісова',
      phone: '+380961122334'
    }
  };

  treatmentReports = [
    {
      created_at: '2025-03-07T10:15:00Z',
      description: 'Первинний огляд, вакцинація проти сказу та обробка від паразитів.',
      money_spent: 800
    },
    {
      created_at: '2025-03-12T14:40:00Z',
      description: 'Перевірка аналізів, консультація з ортопедом, призначено вітаміни.',
      money_spent: 650
    }
  ];

  // 🔹 Форми
  treatmentForm!: FormGroup;
  animalForm!: FormGroup;

  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.animalId = +idParam;
      }
    });
  }

  get canEdit(): boolean {
    return this.role === 'volunteer' || this.role === 'vet';
  }

  ngOnInit(): void {
    // форма з порожніми полями, значення буде заповнено в startEdit()
    this.animalForm = this.fb.group({
      name: [{ value: this.animal.name, disabled: true }, Validators.required],
      breed: [{ value: this.animal.breed, disabled: true }, Validators.required],
      gender: [{ value: this.animal.gender, disabled: true }, Validators.required],
      status: [{ value: this.animal.status, disabled: true }, Validators.required],
      description: [{ value: this.animal.description, disabled: true }, Validators.required],
    });

    this.treatmentForm = this.fb.group({
      description: ['', Validators.required],
      moneySpent: [0, [Validators.required, Validators.min(0)]]
    });
  }

  // 🔹 Фото
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhoto = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
        console.log('📷 Превʼю оновлено:', this.photoPreview);
      };
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  // 🔹 Лікування
  addTreatment(): void {
    if (this.treatmentForm.invalid) {
      this.treatmentForm.markAllAsTouched();
      return;
    }

    const report = {
      created_at: new Date().toISOString(),
      description: this.treatmentForm.value.description.trim(),
      money_spent: this.treatmentForm.value.moneySpent
    };

    if (!report.description || report.money_spent < 0) {
      console.warn('Невірні значення лікування');
      return;
    }

    this.treatmentReports.unshift(report);
    this.treatmentForm.reset({ description: '', moneySpent: 0 });

    console.log('✅ Додано запис в історію лікування:', report);
  }

  // 🔹 Редагування
  startEdit(): void {
    this.isEditing = true;
    this.animalForm.enable();
  }

  saveChanges(): void {
    if (this.animalForm.invalid) {
      this.animalForm.markAllAsTouched();
      return;
    }

    this.animal = {
      ...this.animal,
      ...this.animalForm.value
    };

    this.animalForm.disable();
    this.isEditing = false;

    console.log('✅ Дані тварини оновлено:', this.animal);
  }

  // 🔹 Для звичайного користувача
  toggleFollow(): void {
  if (!this.isAuthenticated) return;

  this.isFollowing = !this.isFollowing;

  if (this.isFollowing) {
    console.log('🔔 Ви почали стежити за твариною з ID:', this.animalId);
    // TODO: надіслати запит POST /animals/:id/follow
  } else {
    console.log('🚫 Ви припинили стежити за твариною з ID:', this.animalId);
    // TODO: надіслати запит DELETE /animals/:id/unfollow
  }
}
}
