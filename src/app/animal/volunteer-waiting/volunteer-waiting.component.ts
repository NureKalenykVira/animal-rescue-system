import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volunteer-waiting',
  imports: [ ],
  templateUrl: './volunteer-waiting.component.html',
  styleUrl: './volunteer-waiting.component.scss'
})
export class VolunteerWaitingComponent {
  volunteer = {
    name: 'Аліна',
    phone: '+380XXXXXXXXX',
    telegram: '@xxxxxx',
    whatsapp: '@xxxxxxx'
  };

  constructor(private router: Router) {}

  goTo(): void {
    this.router.navigate(['/home']);
  }
}
