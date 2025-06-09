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
import { DonationListComponent } from './donation/donation-list/donation-list.component';
import { DonationPaymentComponent } from './donation/donation-payment/donation-payment.component';
import { HomeComponent } from './main/home/home.component';
import { AboutComponent } from './main/about/about.component';
import { GoogleCallbackComponent } from './auth/google-callback.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'animal/report', component: ReportComponent },
  { path: 'animal/volunteer-search', component: VolunteerSearchComponent },
  { path: 'animal/volunteer-waiting', component: VolunteerWaitingComponent },
  { path: 'animal/thank-you', component: ThankYouComponent },
  { path: 'animal/user-profile', component: UserProfileComponent },
  { path: 'animal/animal-list', component: AnimalListComponent },
  { path: 'animal/volunteer-form', component: VolunteerFormComponent },
  { path: 'animal/animal-notification/:id', component: AnimalNotificationComponent },
  { path: 'donation/donation-list', component: DonationListComponent },
  { path: 'donation/donation-payment/:id', component: DonationPaymentComponent },
  { path: 'about', component: AboutComponent },
  { path: 'home', component: HomeComponent },
  { path: 'animal/:id', component: AnimalProfileComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/google/callback', loadComponent: () => import('./auth/google-callback.component').then(m => m.GoogleCallbackComponent) },
  { path: 'admin',  loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      { path: 'users', loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'animals', loadComponent: () => import('./admin/animals/animals.component').then(m => m.AnimalsComponent) },
      { path: 'clinics', loadComponent: () => import('./admin/clinics/clinics.component').then(m => m.ClinicsComponent) },
      { path: 'reports', loadComponent: () => import('./admin/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'treatments', loadComponent: () => import('./admin/treatments/treatments.component').then(m => m.TreatmentsComponent) },
      { path: 'media', loadComponent: () => import('./admin/media/media.component').then(m => m.MediaComponent) },
      { path: 'donations', loadComponent: () => import('./admin/donations/donations.component').then(m => m.DonationsComponent) },
      { path: 'volunteer-request', loadComponent: () => import('./admin/volunteer-request/volunteer-request.component').then(m => m.VolunteerRequestComponent) },
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
