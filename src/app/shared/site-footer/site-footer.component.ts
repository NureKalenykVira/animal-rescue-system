import { Component } from '@angular/core';
import { NgFor, NgIf  } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss'
})
export class SiteFooterComponent {
  topics = [
    {
      title: 'Платформа',
      pages: [
        { name: 'Про нас', link: '/about' },
        { name: 'Тварини', link: '/animal/animal-list' },
      ]
    },
    {
      title: 'Профіль',
      pages: [
        { name: 'Зареєструватися', link: '/auth/register' },
        { name: 'Увійти', link: '/auth/login' },
        { name: 'Профіль', link: '/animal/user-profile' }
      ]
    },
    {
      title: 'Допомога',
      pages: [
        { name: 'Повідомити', link: '/animal/report' },
        { name: 'Зробити донат', link: '/donation/donation-list' },
        { name: 'Мобільний застосунок', link: 'assets/apk/app.apk', isDownload: true }
      ]
    }
  ];
}
