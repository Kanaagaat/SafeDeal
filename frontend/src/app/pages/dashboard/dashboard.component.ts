import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DealService } from '../../shared/services/deal.service';
import { Deal, DealStatus } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  deals: Deal[] = [];
  loading = true;

  // Mock data for development (replace with API call)
  private mockDeals: Deal[] = [
    { id: 1, title: 'MacBook Pro 16" M3 Max', buyer: 'johndoe', seller: 'techseller', price: 3499, status: 'money_secured', role: 'buyer' },
    { id: 2, title: 'Sony A7 IV Camera Body', buyer: 'photographer_jane', seller: 'johndoe', price: 2298, status: 'shipped', role: 'seller' },
    { id: 3, title: 'iPhone 15 Pro Max 256GB', buyer: 'johndoe', seller: 'mobileshop', price: 1199, status: 'payment_pending', role: 'buyer' },
    { id: 4, title: 'Herman Miller Aeron Chair', buyer: 'office_buyer', seller: 'johndoe', price: 895, status: 'completed', role: 'seller' },
  ];

  constructor(private dealService: DealService) {}

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.loading = true;
    // Use API when backend is ready:
    // this.dealService.getDeals().subscribe({ next: d => { this.deals = d; this.loading = false; } });

    // Mock for now:
    setTimeout(() => {
      this.deals = this.mockDeals;
      this.loading = false;
    }, 600);
  }

  getStatusClass(status: DealStatus): string {
    const map: Record<DealStatus, string> = {
      money_secured: 'secured',
      shipped: 'shipped',
      payment_pending: 'pending',
      completed: 'completed',
      in_progress: 'progress',
      cancelled: 'pending'
    };
    return map[status];
  }

  getStatusLabel(status: DealStatus): string {
    const map: Record<DealStatus, string> = {
      money_secured: 'Money Secured',
      shipped: 'Shipped',
      payment_pending: 'Payment Pending',
      completed: 'Completed',
      in_progress: 'In Progress',
      cancelled: 'Cancelled'
    };
    return map[status];
  }
}
