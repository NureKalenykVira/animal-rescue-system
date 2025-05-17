import { Component } from '@angular/core';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-animal-list',
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    NgIf, NgFor,
    RouterModule,
    CommonModule,
    NgClass
  ],
  templateUrl: './animal-list.component.html',
  styleUrl: './animal-list.component.scss'
})
export class AnimalListComponent {
  isAuthenticated = false; // TODO: замінити на реальну перевірку авторизації

  animals: any[] = [];
  visibleAnimals: any[] = [];
  loadStep = 20;
  visibleCount = 0;

  constructor() {
  for (let i = 1; i <= 60; i++) {
    this.animals.push({
      id: i,
      name: `Тварина ${i}`,
      description: `Опис тварини ${i}`,
      photoUrl: 'assets/img/animal-default.jpg',
      status: i % 4, // для фільтрації
      isFollowing: i % 7 === 0
    });
  }
}

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore(): void {
    const nextChunk = this.animals.slice(this.visibleCount, this.visibleCount + this.loadStep);
    this.visibleAnimals.push(...nextChunk);
    this.visibleCount += this.loadStep;
  }

  toggleFollow(animal: any): void {
    animal.isFollowing = !animal.isFollowing;
    console.log(
      animal.isFollowing
        ? `🔔 Додано до підписок: ID ${animal.id}`
        : `🚫 Видалено з підписок: ID ${animal.id}`
    );

    // TODO: відправити запит на сервер POST або DELETE
  }
}
