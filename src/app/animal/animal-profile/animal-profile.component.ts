import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

declare var QRCode: any;
interface Animal {
  id: number;
  name: string;
  breed: string;
  gender: 'Дівчинка' | 'Хлопчик' | 'Невідомо';
  foundDate: string;
  location: string;
  status: number;
  description: string;
  center?: string;
  photoUrl?: string;
  qrCodeUrl?: string;
  subscribed?: boolean;

  media?: {
    count: number;
    result: {
      id: number;
      uploaded_at: number;
      type: number;
      url: string;
    }[];
  };

  current_location?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };

  vetClinic?: {
    name: string;
    address: string;
    phone: string;
  };

  responsibleUser?: {
    name: string;
    role: string;
    phone: string;
  };

  responsibleVolunteer?: {
    name: string;
    phone: string;
  };
}
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
  animal: Animal | null = null;
  animalId!: number;
  isAuthenticated = true;
  isEditing = false;
  isFollowing = false;
  role: 'user' | 'volunteer' | 'vet' = 'vet';

  statusLabels: { [key: number]: string } = {
    0: 'невідомо',
    1: 'знайдений/a',
    2: 'на лікуванні',
    3: 'здоровий/a',
    4: 'очікую на усиновлення',
    5: 'усиновлений/a'
  };

  treatmentReports: any[] = [];

  treatmentForm!: FormGroup;
  animalForm!: FormGroup;

  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.animalId = +idParam;
      }
    });
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      breed: ['', Validators.required],
      gender: ['', Validators.required],
      foundDate: [''],
      location: [''],
      status: [0, Validators.required],
      description: ['', Validators.required],
    });
    this.animalForm.disable();
  }

  get canEdit(): boolean {
    return this.role === 'volunteer' || this.role === 'vet';
  }

  ngOnInit(): void {
    this.role = (localStorage.getItem('role') as 'user' | 'volunteer' | 'vet') || 'user';
    this.isAuthenticated = !!localStorage.getItem('access_token');
    this.fetchAnimal();
    this.loadTreatmentReports();

    this.treatmentForm = this.fb.group({
      description: ['', Validators.required],
      moneySpent: [0, [Validators.required, Validators.min(0)]]
    });
  }

  fetchAnimal(): void {
    fetch(`https://kkp-api.ruslan.page/api/animals/${this.animalId}`, {
      headers: {
        'x-token': localStorage.getItem('access_token') || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('[DEBUG] Отримано тварину з бекенду:', data);
        if (!data || !data.id) {
          console.error('Некоректна відповідь від сервера:', data);
          return;
        }

        console.log('[DEBUG] updated_at:', data.updated_at);
        this.animal = {
          ...data,
          foundDate: new Date(data.updated_at * 1000).toLocaleDateString('uk-UA'),
          location: 'невідомо',
        };
        this.photoPreview = data.media?.result?.[0]?.url || null;

        if (data.current_location?.latitude && data.current_location?.longitude) {
        const geocoder = new google.maps.Geocoder();
        const latlng = {
          lat: data.current_location.latitude,
          lng: data.current_location.longitude
        };

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            this.animal!.location = address;
            this.animalForm.patchValue({ location: address });
            this.cdr.detectChanges();
          } else {
            this.animal!.location = 'невідомо';
          }
        });
      }

        setTimeout(() => {
          const qrText = `https://998f-45-152-72-1.ngrok-free.app/animal/${this.animalId}`;
          const qrElement = document.getElementById('qrCode');

          if (qrElement) {
            qrElement.innerHTML = '';
            new QRCode(qrElement, {
              text: qrText,
              width: 128,
              height: 128,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
          }
        }, 0);

        const genderReverseMap: { [key: number]: string } = {
          0: 'Невідомо',
          1: 'Хлопчик',
          2: 'Дівчинка'
        };

        this.animalForm.patchValue({
          name: data.name || '',
          breed: data.breed || '',
          gender: genderReverseMap[data.gender] ?? 'Невідомо',
          status: data.status ?? 0,
          description: data.description || '',
          foundDate: new Date(data.updated_at).toLocaleDateString('uk-UA'),
          location: data.current_location?.name || 'невідомо',
        });

        this.isFollowing = data.subscribed ?? false;
      })
      .catch(err => {
        console.error('Помилка завантаження тварини:', err);
      });
  }

  // Фото
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const token = localStorage.getItem('access_token') || '';

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    // POST /media
    fetch('https://kkp-api.ruslan.page/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify({
        filename: file.name,
        type: 1,
        size: file.size
      })
    })
      .then(res => res.json())
      .then(media => {
        if (!media.upload_url || !media.id) throw new Error('Неправильна відповідь від /media');
        const uploadUrl = media.upload_url;
        const mediaId = media.id;

        // PUT на upload_url
        return fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type
          },
          body: file
        }).then(() => mediaId);
      })
      .then(mediaId => {

        // PATCH /animals/{id}
        return fetch(`https://kkp-api.ruslan.page/api/animals/${this.animalId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-token': token
          },
          body: JSON.stringify({
            add_media_ids: [mediaId]
          })
        });
      })
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося оновити тварину');
        alert('Фото оновлено');
      })
      .catch(err => {
        console.error('Помилка:', err);
        alert('Не вдалося завантажити фото');
      });
  }

  // Лікування
  addTreatment(): void {
    if (this.treatmentForm.invalid) {
      this.treatmentForm.markAllAsTouched();
      return;
    }

    const treatment = {
      animal_report_id: this.animalId,
      description: this.treatmentForm.value.description.trim(),
      money_spent: this.treatmentForm.value.moneySpent,
    };

    const token = localStorage.getItem('access_token') || '';

    fetch(`https://kkp-api.ruslan.page/api/treatment-reports`, {
      method: 'POST',
      headers: {
        'x-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treatment),
    })
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося додати лікування');
        return res.json();
      })
      .then(data => {
        if (data?.animal_report?.animal?.updated_at && data.animal_report.animal?.id) {
          const animalId = data.animal_report.animal.id;
          const updatedAt = data.animal_report.animal.updated_at;
          localStorage.setItem(`lastSeenUpdate:${animalId}`, updatedAt.toString());
          console.log(`[Notification] Збережено updated_at ${updatedAt} для тварини ${animalId}`);
        }
        this.treatmentForm.reset({ description: '', moneySpent: 0 });
        this.loadTreatmentReports();
      })
      .catch(err => {
        alert('Помилка при додаванні лікування: ' + err.message);
      });
  }

  loadTreatmentReports(): void {
    const token = localStorage.getItem('access_token') || '';

    fetch(`https://kkp-api.ruslan.page/api/animals/${this.animalId}/treatment-reports`, {
      headers: {
        'x-token': token
      }
    })
      .then(res => res.json())
      .then(data => {
        this.treatmentReports = data.result.map((r: any) => ({
          ...r,
          created_at: new Date(r.created_at * 1000).toLocaleString('uk-UA', {
            dateStyle: 'short',
            timeStyle: 'short'
          })
        }));
      })
      .catch(err => {
        console.error('Не вдалося завантажити лікування:', err);
      });
  }

  // Редагування
  startEdit(): void {
    this.isEditing = true;
    this.animalForm.enable();
  }

  getStatusKeys(): number[] {
    return Object.keys(this.statusLabels).map(key => +key);
  }

  saveChanges(): void {
    console.log('valid?', this.animalForm.valid);
    console.log('pristine?', this.animalForm.pristine);
    if (this.animalForm.invalid || this.animalForm.pristine) {
      this.animalForm.markAllAsTouched();
      return;
    }

    const formValues = this.animalForm.getRawValue();

    console.log('[DEBUG] Введені дані форми:', formValues);
    console.log('[DEBUG] Поточні дані тварини:', this.animal);

    const genderMap: { [key: string]: number } = {
      'Невідомо': 0,
      'Хлопчик': 1,
      'Дівчинка': 2
    };

    const patchBody = {
      name: formValues.name || '',
      breed: formValues.breed || '',
      gender: genderMap[formValues.gender] ?? 0,
      status: Number(formValues.status) || 0,
      description: formValues.description || '',
      add_media_ids: this.animal?.media?.result?.map(m => m.id) ?? [],
      remove_media_ids: [],
      current_latitude: this.animal?.current_location?.latitude ?? 0,
      current_longitude: this.animal?.current_location?.longitude ?? 0
    };

    console.log('[DEBUG] Дані, що надсилаються на сервер (PATCH):', patchBody);

    fetch(`https://kkp-api.ruslan.page/api/animals/${this.animalId}`, {
      method: 'PATCH',
      headers: {
        'x-token': localStorage.getItem('access_token') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchBody)
    })
      .then(res => {
        console.log('[DEBUG] Відповідь сервера:', res);
        if (!res.ok) throw new Error('Помилка оновлення');
        return res.json();
      })
      .then(updatedAnimal => {
        console.log('[DEBUG] Оновлена тварина з сервера:', updatedAnimal);
        this.animal = updatedAnimal;
        this.animalForm.disable();
        this.isEditing = false;
        alert('Зміни збережено');
      })
      .catch(err =>
        alert('Помилка при збереженні: ' + err.message));
  }

  // Для звичайного користувача
  get statusText(): string {
    return this.statusLabels[this.animal?.status ?? 0] || 'на шляху до нового життя';
  }

  toggleFollow(): void {
    if (!this.isAuthenticated) return;

    const url = `https://kkp-api.ruslan.page/api/subscriptions/${this.animalId}`;
    const method = this.isFollowing ? 'DELETE' : 'PUT';

    fetch(url, {
      method,
      headers: {
        'x-token': localStorage.getItem('access_token') || ''
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося змінити статус підписки');

        this.isFollowing = !this.isFollowing;
        if (this.animal) {
          this.animal.subscribed = this.isFollowing;
        }

        this.cdr.detectChanges();
      })
      .catch(err => alert(err.message));
  }
}
