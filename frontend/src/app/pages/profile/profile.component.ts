import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { UserService, UserProfile, RatingDto } from '../../core/services/user.service';
import { DealService, Deal } from '../../core/services/deal.service';
import { TransactionService, TransactionRecord } from '../../core/services/transaction.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { normalizeDealStatus } from '../../core/utils/deal-status';

type Tab = 'deals' | 'tx' | 'reviews';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, SkeletonLoaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private readonly users = inject(UserService);
  private readonly deals = inject(DealService);
  private readonly tx = inject(TransactionService);

  readonly loading = signal(true);
  readonly tab = signal<Tab>('deals');
  profile: UserProfile | null = null;
  dealHistory: Deal[] = [];
  transactions: TransactionRecord[] = [];
  ratings: RatingDto[] = [];
  completedCount = 0;
  cancelledCount = 0;

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      profile: this.users.getProfile(),
      deals: this.deals.getDeals(),
      tx: this.tx.getTransactions()
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ profile, deals, tx }) => {
          this.profile = profile;
          this.dealHistory = deals;
          this.transactions = tx;
          this.completedCount = deals.filter((d) => normalizeDealStatus(d) === 'RE').length;
          this.cancelledCount = deals.filter((d) => normalizeDealStatus(d) === 'CA').length;
          this.users.getRatings(profile.id).subscribe({
            next: (r) => (this.ratings = r),
            error: () => (this.ratings = [])
          });
        }
      });
  }

  setTab(t: Tab): void {
    this.tab.set(t);
  }

  stars(n: number): number[] {
    const c = Math.min(5, Math.max(0, Math.round(n)));
    return Array(c).fill(0);
  }

  emptyStars(n: number): number[] {
    return Array(5 - Math.min(5, Math.max(0, Math.round(n)))).fill(0);
  }

  statusOf(d: Deal) {
    return normalizeDealStatus(d);
  }

  displayName(p: UserProfile): string {
    const fn = (p.first_name || '').trim();
    const ln = (p.last_name || '').trim();
    if (fn || ln) return `${fn} ${ln}`.trim();
    return p.username;
  }
}
