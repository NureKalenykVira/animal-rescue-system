import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReportComponent } from './animal/report/report.component';
import { VolunteerSearchComponent } from './animal/volunteer-search/volunteer-search.component';
import { VolunteerWaitingComponent } from './animal/volunteer-waiting/volunteer-waiting.component';
import { UserProfileComponent } from './animal/user-profile/user-profile.component';
import { ThankYouComponent } from './animal/thank-you/thank-you.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'animal/report', component: ReportComponent },
  { path: 'animal/volunteer-search', component: VolunteerSearchComponent },
  { path: 'animal/volunteer-waiting', component: VolunteerWaitingComponent },
  { path: 'animal/thank-you', component: ThankYouComponent },
  { path: 'animal/user-profile', component: UserProfileComponent },
  { path: '**', redirectTo: 'auth/login' }
];
