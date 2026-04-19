import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  readonly wallet = inject(WalletService);

  menuOpen = false;
  private sub?: Subscription;

  ngOnInit(): void {
    this.wallet.refreshBalance().subscribe({ error: () => undefined });
    this.sub = timer(0, 60000)
      .pipe(switchMap(() => this.wallet.refreshBalance().pipe(catchError(() => of(null)))))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }
}
