import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReportComponent } from './animal/report/report.component';
import { VolunteerSearchComponent } from './animal/volunteer-search/volunteer-search.component';
import { VolunteerWaitingComponent } from './animal/volunteer-waiting/volunteer-waiting.component';
import { UserProfileComponent } from './animal/user-profile/user-profile.component';
import { ThankYouComponent } from './animal/thank-you/thank-you.component';
import { AnimalListComponent } from './animal/animal-list/animal-list.component';
import { AnimalProfileComponent } from './animal/animal-profile/animal-profile.component';
import { AnimalNotificationComponent } from './animal/animal-notification/animal-notification.component';
import { VolunteerFormComponent } from './animal/volunteer-form/volunteer-form.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'animal/report', component: ReportComponent },
  { path: 'animal/volunteer-search', component: VolunteerSearchComponent },
  { path: 'animal/volunteer-waiting', component: VolunteerWaitingComponent },
  { path: 'animal/thank-you', component: ThankYouComponent },
  { path: 'animal/user-profile', component: UserProfileComponent },
  { path: 'animal/animal-list', component: AnimalListComponent },
  { path: 'animal/volunteer-form', component: VolunteerFormComponent },
  { path: 'animal/animal-notification', component: AnimalNotificationComponent },
  { path: 'animal/:id', component: AnimalProfileComponent },
  { path: '**', redirectTo: 'auth/login' }
];
