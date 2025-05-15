import { Component } from '@angular/core';

@Component({
  selector: 'app-volunteer-waiting',
  imports: [],
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
}
