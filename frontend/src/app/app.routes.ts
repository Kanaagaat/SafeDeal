import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingPageComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthPageComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'deals/create',
    loadComponent: () =>
      import('./pages/create-deal/create-deal.component').then((m) => m.CreateDealComponent),
    canActivate: [authGuard]
  },
  {
    path: 'deals/:id',
    loadComponent: () =>
      import('./pages/deal-detail/deal-detail.component').then((m) => m.DealDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'wallet',
    loadComponent: () => import('./pages/wallet/wallet.component').then((m) => m.WalletComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'landing' }
];
