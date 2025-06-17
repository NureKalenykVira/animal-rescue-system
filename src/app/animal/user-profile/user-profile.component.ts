import { Component, OnInit } from '@angular/core';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AnimalService } from '../../services/animal.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
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
    FormsModule,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  role: 'user' | 'volunteer' | 'vet' = 'user';
  isAdmin = false;
  messages: any[] = [];
  isEditing = false;
  showPasswordChange = false;
  originalPassword = '';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError: 'old' | 'short' | 'mismatch' | null = null;
  animals: { id: number; name: string; image: string }[] = [];
  photoPreview: string | null = null;
  selectedPhoto: File | null = null;
  selectedFileName: string | null = null;
  photoURL: string | null = null;
  apiUrl = 'https://kkp-api.ruslan.page/api';

  user = {
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    photo: null as null | {
      id: number;
      uploaded_at: number;
      type: number;
      url: string;
    },
    telegram_username: '',
    viber_phone: '',
    whatsapp_phone: ''
  };

  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService,
    private animalService: AnimalService
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telegram_username: [''],
      viber_phone: [''],
      whatsapp_phone: ['']
    });
    this.profileForm.disable();
  }

  getRoleFromCode(roleCode: number): 'user' | 'volunteer' | 'vet' {
    if (roleCode === 0) return 'user';
    if (roleCode === 11) return 'volunteer';
    if (roleCode === 10) return 'vet';
    return 'user';
  }

  checkIfAdmin(roleCode: number): boolean {
    return [100, 999, 777].includes(roleCode);
  }

  ngOnInit(): void {
    const newAnimal = history.state?.newAnimal;
    const state = history.state;
    const fullReport = state.fullReport;

    if (!this.authService.isAuthenticated()) {
      console.warn('Користувач не авторизований — перенаправлення на логін');
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserInfo().subscribe({
  next: user => {
    this.user = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      photo: user.photo,
      telegram_username: user.telegram_username,
      viber_phone: user.viber_phone,
      whatsapp_phone: user.whatsapp_phone
    };

    this.role = this.getRoleFromCode(user.role);
    this.isAdmin = this.checkIfAdmin(user.role);
    localStorage.setItem('role', this.role);
    localStorage.setItem('isAdmin', String(this.isAdmin));

    this.profileForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      telegram_username: user.telegram_username,
      viber_phone: user.viber_phone,
      whatsapp_phone: user.whatsapp_phone,
    });

    const updates: any[] = [];

    this.animalService.getUserSubscriptions().subscribe({
      next: res => {
        const fromApi = res.result.map((animal: any) => {
          const lastSeen = Number(localStorage.getItem(`lastSeenUpdate:${animal.id}`)) || 0;
          const hasUpdate = animal.updated_at > lastSeen;

          if (hasUpdate) {
            updates.push({
              type: 'update',
              animalId: animal.id,
              animal: {
                name: animal.name
              },
              created_at: animal.updated_at * 1000
            });
          }

          return {
            id: animal.id,
            name: animal.name,
            image: animal.media?.result?.[0]?.url || 'assets/img/animal-default.jpg'
          };
        });

        this.animals = newAnimal
          ? [newAnimal, ...fromApi.filter((a: { id: number }) => a.id !== newAnimal.id)]
          : fromApi;
      },
      error: err => {
        console.error('Не вдалося отримати підписки користувача:', err);
      }
    });

    const allowedRoles = [10, 11, 100, 999];
    if (allowedRoles.includes(user.role)) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          this.animalService.getAnimalReports(lat, lon).subscribe({
            next: res => {
              console.log('[🐾] Отримано репорти з координатами:', res);

              if (Array.isArray(res.result)) {
                const newMessages = res.result.map((report: any) => ({
                  ...report,
                  type: 'new',
                  created_at: report.created_at ? report.created_at * 1000 : Date.now()
                }));

                this.messages = [...newMessages, ...updates].sort((a, b) => b.created_at - a.created_at);

                console.log('[✅] Повідомлення оновлено. Всього:', this.messages.length);
              } else {
                console.warn('⚠️ res.result не є масивом:', res.result);
              }
            },
            error: err => {
              console.error('Не вдалося отримати повідомлення:', err);
            }
          });
        });
      }
    }
  },
  error: err => {
    console.error('Не вдалося отримати інформацію про користувача:', err);
    console.error('Деталі помилки:', err.error);
  }
});
  }

  get first_name() { return this.profileForm.get('first_name')!; }
  get last_name() { return this.profileForm.get('last_name')!; }
  get email() { return this.profileForm.get('email')!; }

  startEdit(): void {
    this.isEditing = true;
    this.profileForm.enable();
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.commitSave()
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    this.selectedPhoto = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoURL = reader.result as string;
    };
    reader.readAsDataURL(file);

    const mediaPayload = {
      type: 1,
      size: file.size
    };

    this.http.post<any>(`${this.apiUrl}/media`, mediaPayload).subscribe({
      next: res => {
        console.log('MEDIA ID:', res.id);
        const mediaId = res.id;
        if (!mediaId || isNaN(mediaId)) {
          console.error('Отримано некоректний media_id:', mediaId);
          return;
        }
        const uploadUrl = res.upload_url;

        fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        })
          .then(() => this.http.post(`${this.apiUrl}/media/${mediaId}/finalize`, {}).toPromise())
          .then(() => {
            const payload = {
              first_name: this.profileForm.get('first_name')?.value,
              last_name: this.profileForm.get('last_name')?.value,
              email: this.profileForm.get('email')?.value,
              photo_id: mediaId
            };

            this.userService.updateUserInfo(payload).subscribe({
              next: () => {
                console.log('Фото оновлено автоматично');
                this.user.photo = {
                  id: mediaId,
                  uploaded_at: Date.now(),
                  type: 1,
                  url: this.photoURL!
                };
              },
              error: err => console.error('Помилка оновлення профілю з фото:', err)
            });
          })
          .catch(err => {
            console.error('Помилка завантаження або фіналізації фото:', err);
          });
      },
      error: err => {
        console.error('Помилка створення media:', err);
      }
    });
  }

  private saveProfile(data: any): void {
    this.userService.updateUserInfo(data).subscribe({
      next: () => {
        console.log('✅ Профіль збережено');
        this.isEditing = false;
        this.profileForm.disable();
        this.selectedPhoto = null;
        this.photoPreview = null;
      },
      error: err => {
        console.error('❌ Помилка збереження профілю:', err);
      }
    });
  }

  commitSave(): void {
    this.isEditing = false;
    this.profileForm.disable();

    const data = this.profileForm.value;
    this.userService.updateUserInfo(data).subscribe({
      next: () => {
        console.log('Зміни профілю збережено');
      },
      error: err => {
        console.error('Помилка збереження профілю:', err);
      }
    });
  }

  openAnimalForm(msg: any) {
    console.log('[openAnimalForm] clicked message:', msg);
    if (msg.type === 'new') {
      this.router.navigate(['animal/animal-notification', msg.id]);
    } else if (msg.type === 'update') {
      localStorage.setItem(
        `lastSeenUpdate:${msg.animalId}`,
        Math.floor(Date.now() / 1000).toString()
      );
      this.router.navigate(['/animal', msg.animalId]);
      this.rejectMessage(msg);
    }
  }

  acceptAnimal(msg: any): void {
    this.animalService.assignToReport(msg.id).subscribe({
      next: () => {
        this.animalService.getAnimalReportById(msg.id).subscribe({
          next: (report) => {
            const animalToPush = {
              id: report.animal.id,
              name: report.animal.name,
              image: report.media?.[0]?.url || report.animal.media?.result?.[0]?.url || 'assets/img/animal-default.jpg'
            };
            this.animals.unshift(animalToPush);
            this.rejectMessage(msg);
            this.router.navigate(['/animal', report.animal.id], {
              state: {
                newAnimal: animalToPush,
                fullReport: report
              }
            });
          },
          error: err => {
            console.error('❌ Не вдалося отримати звіт для переходу:', err);
          }
        });
      },
      error: err => {
        console.error('❌ Не вдалося підтвердити тварину:', err);
      }
    });
  }

  rejectMessage(msg: { id: number }) {
    this.messages = this.messages.filter(m => m !== msg);
  }

  submitPasswordChange(): void {
    this.passwordError = null;

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) return;

    if (this.newPassword.length < 6) {
      this.passwordError = 'short';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'mismatch';
      return;
    }

    this.userService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        console.log('Пароль змінено');
        this.showPasswordChange = false;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: err => {
        console.error('Помилка зміни пароля:', err);
        this.passwordError = 'old';
      }
    });
  }
}
