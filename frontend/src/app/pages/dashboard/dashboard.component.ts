import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DealService, Deal } from '../../shared/services/deal.service';
import { AuthService } from '../../shared/services/auth.service';
import { take } from 'rxjs';

interface DealWithRole extends Deal {
  role: 'buyer' | 'seller';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  deals: DealWithRole[] = [];
  loading = true;

  constructor(private dealService: DealService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadDeals();
    } else {
      this.authService.currentUser$.pipe(take(1)).subscribe(() => {
        this.loadDeals();
      });
    }
  }

  loadDeals(): void {
    this.loading = true;
    this.dealService.getDeals().subscribe({
      next: (deals) => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.deals = deals.map(deal => ({
            ...deal,
            role: deal.buyer.username === currentUser.username ? 'buyer' : 'seller'
          }));
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading deals:', error);
        this.deals = [];
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'CR': 'pending',
      'PA': 'pending',
      'SE': 'secured',
      'SH': 'shipped',
      'DE': 'delivered',
      'RE': 'completed',
      'DI': 'warning',
      'CA': 'cancelled'
    };
    return map[status] || 'pending';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'CR': 'Created',
      'PA': 'Paid',
      'SE': 'Secured',
      'SH': 'Shipped',
      'DE': 'Delivered',
      'RE': 'Released',
      'DI': 'Disputed',
      'CA': 'Cancelled'
    };
    return map[status] || status;
  }
}
