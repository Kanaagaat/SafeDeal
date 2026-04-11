import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { DealService, Deal } from '../../shared/services/deal.service';
import { TransactionService, TransactionRecord } from '../../shared/services/transaction.service';
import { ToastService } from '../../shared/services/toast.service';
import { UserProfile } from '../../shared/models/models';
import { forkJoin, finalize } from 'rxjs';

interface DealWithRole extends Deal {
  role: 'buyer' | 'seller';
}

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
  dealHistory: DealWithRole[] = [];
  transactionHistory: TransactionRecord[] = [];

  constructor(
    private authService: AuthService,
    private dealService: DealService,
    private transactionService: TransactionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    forkJoin({
      profile: this.authService.getProfile(),
      deals: this.dealService.getDeals(),
      transactions: this.transactionService.getTransactions()
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ profile, deals, transactions }) => {
        const completedDeals = deals.filter(deal => deal.deal_status === 'DE' || deal.deal_status === 'RE' || deal.deal_status === 'DELIVERED' || deal.deal_status === 'RELEASED').length;
        const totalVolume = deals.reduce((sum, deal) => sum + (Number(deal.price) || 0), 0);
        const recentDeals = deals.slice(-3).reverse();

        this.profile = {
          username: profile.username,
          memberSince: profile.date_joined ? new Date(profile.date_joined).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric'
          }) : 'Member',
          avatar: profile.username.charAt(0).toUpperCase(),
          trustScore: profile.trust_score || 0,
          completedDeals,
          totalVolume,
          recentDeals,
          reviews: []
        };

        this.dealHistory = deals.map(deal => ({
          ...deal,
          role: deal.buyer.username === profile.username ? 'buyer' : 'seller'
        }));

        this.transactionHistory = transactions || [];
      },
      error: (error) => {
        console.error('Error loading profile or history:', error);
        this.toastService.error('Unable to load profile history. Please try again later.');
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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      CR: 'pending',
      PA: 'pending',
      SE: 'secured',
      SH: 'shipped',
      DE: 'delivered',
      RE: 'completed',
      DI: 'warning',
      CA: 'cancelled'
    };
    return map[status] || 'pending';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      CR: 'Created',
      PA: 'Paid',
      SE: 'Secured',
      SH: 'Shipped',
      DE: 'Delivered',
      RE: 'Released',
      DI: 'Disputed',
      CA: 'Cancelled'
    };
    return map[status] || status;
  }
}
