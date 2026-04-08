import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserProfile, DealStatus } from '../../shared/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, TitleCasePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profile = {
        username: user.username,
        memberSince: 'Member',
        avatar: user.username.charAt(0).toUpperCase(),
        trustScore: user.trust_score || 0,
        completedDeals: 0,
        totalVolume: 0,
        recentDeals: [],
        reviews: []
      };
    }
    
    this.authService.getProfile().subscribe({
      next: (userData: any) => {
        this.profile = {
          username: userData.username,
          memberSince: 'Member',
          avatar: userData.username.charAt(0).toUpperCase(),
          trustScore: userData.trust_score || 0,
          completedDeals: 0,
          totalVolume: 0,
          recentDeals: [],
          reviews: []
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  formatVolume(amount: number): string {
    if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
    return `${amount}`;
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getStatusClass(status: DealStatus): string {
    const map: Record<DealStatus, string> = {
      money_secured: 'secured', shipped: 'shipped',
      payment_pending: 'pending', completed: 'completed',
      in_progress: 'progress', cancelled: 'pending'
    };
    return map[status];
  }

  getStatusLabel(status: DealStatus): string {
    const map: Record<DealStatus, string> = {
      money_secured: 'Money Secured', shipped: 'Shipped',
      payment_pending: 'Payment Pending', completed: 'Completed',
      in_progress: 'In Progress', cancelled: 'Cancelled'
    };
    return map[status];
  }
}
