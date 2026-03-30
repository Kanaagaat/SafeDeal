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

  private mockProfile: UserProfile = {
    username: 'johndoe',
    memberSince: 'January 2025',
    avatar: 'J',
    trustScore: 4.8,
    completedDeals: 24,
    totalVolume: 49000,
    recentDeals: [
      { id: 1, title: 'MacBook Pro 16" M3 Max', buyer: 'johndoe', seller: 'techseller', price: 3499, status: 'in_progress', role: 'buyer' },
      { id: 2, title: 'Sony A7 IV Camera', buyer: 'photographer_jane', seller: 'johndoe', price: 2298, status: 'completed', role: 'seller' },
      { id: 3, title: 'Herman Miller Aeron Chair', buyer: 'office_buyer', seller: 'johndoe', price: 895, status: 'completed', role: 'seller' },
    ],
    reviews: [
      { id: 1, author: 'techseller', rating: 5, comment: 'Great buyer, fast payment and good communication!', date: '2026-03-15' },
      { id: 2, author: 'photographer_jane', rating: 5, comment: 'Smooth transaction, highly recommended seller.', date: '2026-03-10' },
      { id: 3, author: 'mobileshop', rating: 4, comment: 'Good experience overall.', date: '2026-03-05' },
    ]
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    // Uncomment when backend is ready:
    // this.authService.getProfile().subscribe({ next: p => { this.profile = p; this.loading = false; } });

    setTimeout(() => {
      this.profile = this.mockProfile;
      this.loading = false;
    }, 600);
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
