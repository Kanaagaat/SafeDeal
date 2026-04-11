import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: any = null;
  balance: number = 0;
  escrowBalance: number = 0;
  menuOpen = false;
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Initial load of current user
    this.currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = this.authService.isLoggedIn();
    
    // Subscribe to user changes
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = this.authService.isLoggedIn();
        if (this.isLoggedIn && user) {
          this.updateBalance();
        }
      })
    );
    
    // Initial balance load
    if (this.isLoggedIn) {
      this.updateBalance();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updateBalance(): void {
    // First try to get from current user
    const user = this.authService.getCurrentUser();
    if (user) {
      this.balance = user.balance || 0;
      this.escrowBalance = user.escrow_balance || 0;
    }
    
    // Then sync with API
    this.authService.getBalance().subscribe({
      next: (data) => {
        this.balance = data.balance || 0;
        this.escrowBalance = data.escrow_balance || 0;
      },
      error: (error) => console.error('Error loading balance:', error)
    });
  }
}
