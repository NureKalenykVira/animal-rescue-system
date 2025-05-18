import { Component } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { SiteHeaderComponent } from '../../shared/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';

@Component({
  selector: 'app-about',
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  constructor(private scroller: ViewportScroller) {}

  scrollTo(anchor: string): void {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}
