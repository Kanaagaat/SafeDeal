import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { DealResolver } from './shared/resolvers/deal.resolver';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'deal/:id',
    loadComponent: () => import('./pages/deal-detail/deal-detail.component').then(m => m.DealDetailComponent),
    canActivate: [AuthGuard],
    resolve: { deal: DealResolver }
  },
  {
    path: 'create-deal',
    loadComponent: () => import('./pages/create-deal/create-deal.component').then(m => m.CreateDealComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'wallet',
    loadComponent: () => import('./pages/wallet/wallet.component').then(m => m.WalletComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
