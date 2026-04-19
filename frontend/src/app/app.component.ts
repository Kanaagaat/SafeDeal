import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="app-shell" [class.with-nav]="showNavbar">
      <app-navbar *ngIf="showNavbar" />
      <main class="main" [class.with-nav]="showNavbar">
        <router-outlet />
      </main>
      <app-toast />
    </div>
  `,
  styles: [
    `
      .app-shell {
        min-height: 100vh;
        background: var(--surface, #0f172a);
      }
      .main.with-nav {
        padding-top: 64px;
      }
    `
  ]
})
export class AppComponent {
  private readonly router = inject(Router);
  showNavbar = false;

  constructor() {
    this.syncNav(this.router.url);
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.syncNav(e.urlAfterRedirects);
    });
  }

  private syncNav(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    this.showNavbar =
      path.startsWith('/dashboard') ||
      path.startsWith('/deals') ||
      path.startsWith('/wallet') ||
      path.startsWith('/profile');
  }
}
