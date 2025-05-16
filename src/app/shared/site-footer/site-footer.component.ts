import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-site-footer',
  imports: [NgFor],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss'
})
export class SiteFooterComponent {
  topics = [
    { title: 'Topic', pages: ['Page', 'Page', 'Page'] },
    { title: 'Topic', pages: ['Page', 'Page', 'Page'] },
    { title: 'Topic', pages: ['Page', 'Page', 'Page'] }
  ];
}
