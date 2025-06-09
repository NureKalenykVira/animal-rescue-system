import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../services/animal.service';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [SiteHeaderComponent, SiteFooterComponent, NgIf, NgFor, RouterModule, NgClass, FormsModule],
  templateUrl: './animal-list.component.html',
  styleUrl: './animal-list.component.scss'
})
export class AnimalListComponent implements OnInit {
  allAnimals: any[] = [];        // Всі тварини з бекенду
  visibleAnimals: any[] = [];    // Видимі зараз
  loadStep = 20;                 // Кількість тварин на сторінку
  visibleCount = 0;
  totalCount = 0;

  selectedStatus: string = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  isAuthenticated = false;
  token = '';

  constructor(private http: HttpClient, private animalService: AnimalService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('access_token');
    this.token = stored || '';
    this.isAuthenticated = !!this.token;
    this.fetchAnimals();
  }

  async fetchAnimals(): Promise<void> {
    let params = new HttpParams()
      .set('order_by', 'updated_at')
      .set('order', this.sortOrder);

    if (this.selectedStatus) {
      params = params.set('status', this.selectedStatus);
    }

    const headers = this.token
      ? new HttpHeaders({
          'x-token': this.token
        })
      : undefined;

    try {
      const res = await this.http
        .get<any>('https://kkp-api.ruslan.page/api/animals', { params, headers })
        .toPromise();

      const animalPromises = res.result.map(async (animal: any) => {
        const photoUrl = animal.media?.result?.[0]?.url || '';
        return {
          id: animal.id,
          name: animal.name,
          description: animal.description,
          photoUrl,
          isFollowing: animal.subscribed ?? false
        };
      });

      const finalAnimals = await Promise.all(animalPromises);

      this.allAnimals = finalAnimals;
      this.totalCount = res.count || finalAnimals.length;

      this.visibleAnimals = this.allAnimals.slice(0, this.loadStep);
      this.visibleCount = this.visibleAnimals.length;

      console.log(
        '[fetchAnimals] allAnimals:', this.allAnimals.length,
        'visibleAnimals:', this.visibleAnimals.length,
        'loadMoreVisible:', this.visibleAnimals.length < this.allAnimals.length
      );
    } catch (err) {
      console.error('Помилка завантаження тварин:', err);
    }
  }

  loadMore(): void {
    const nextChunk = this.allAnimals.slice(this.visibleCount, this.visibleCount + this.loadStep);
    this.visibleAnimals.push(...nextChunk);
    this.visibleCount = this.visibleAnimals.length;
    console.log(
      '[fetchAnimals] allAnimals:', this.allAnimals.length,
      'visibleAnimals:', this.visibleAnimals.length,
      'loadMoreVisible:', this.visibleAnimals.length < this.allAnimals.length
    );
  }

  toggleFollow(animal: any): void {
    if (!this.token) return;
    const obs = animal.isFollowing
      ? this.animalService.unfollowAnimal(animal.id, this.token)
      : this.animalService.followAnimal(animal.id, this.token);

    obs.subscribe({
      next: () => {
        animal.isFollowing = !animal.isFollowing;
        let list = JSON.parse(localStorage.getItem('subscribedAnimalIds') || '[]');
        if (animal.isFollowing) {
          list.push(animal.id);
        } else {
          list = list.filter((id: number) => id !== animal.id);
        }
        localStorage.setItem('subscribedAnimalIds', JSON.stringify([...new Set(list)]));
      },
      error: err => console.error('Помилка при зміні підписки:', err)
    });
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.resetAndFetch();
  }

  applyFilters(): void {
    this.resetAndFetch();
  }

  resetFilters(): void {
    this.selectedStatus = '';
    this.sortOrder = 'desc';
    this.resetAndFetch();
  }

  resetAndFetch(): void {
    this.allAnimals = [];
    this.visibleAnimals = [];
    this.visibleCount = 0;
    this.totalCount = 0;
    this.fetchAnimals();
  }
}
