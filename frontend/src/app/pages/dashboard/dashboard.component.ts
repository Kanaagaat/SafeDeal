import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DealService, Deal } from '../../core/services/deal.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { RatingPromptModalComponent } from '../../shared/components/rating-prompt-modal/rating-prompt-modal.component';
import { ToastService } from '../../core/services/toast.service';
import {
  normalizeDealStatus,
  isActiveDashboardStatus,
  isReleasedStatus,
  isCancelledStatus,
  isDisputedStatus
} from '../../core/utils/deal-status';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled' | 'disputed';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    RatingPromptModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly dealService = inject(DealService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly loading = signal(true);
  readonly deals = signal<Deal[]>([]);
  readonly filter = signal<FilterTab>('all');
  readonly search = signal('');

  readonly ratingDeal = signal<Deal | null>(null);

  readonly filteredDeals = computed(() => {
    const list = this.deals();
    const f = this.filter();
    const q = this.search().trim().toLowerCase();
    let out = list;
    if (f === 'active') {
      out = out.filter((d) => isActiveDashboardStatus(normalizeDealStatus(d)));
    } else if (f === 'completed') {
      out = out.filter((d) => isReleasedStatus(normalizeDealStatus(d)));
    } else if (f === 'cancelled') {
      out = out.filter((d) => isCancelledStatus(normalizeDealStatus(d)));
    } else if (f === 'disputed') {
      out = out.filter((d) => isDisputedStatus(normalizeDealStatus(d)));
    }
    if (q) {
      out = out.filter((d) => {
        const title = (d.title || d.product_name || '').toLowerCase();
        const seller = d.seller?.username?.toLowerCase() ?? '';
        const buyer = d.buyer?.username?.toLowerCase() ?? '';
        return title.includes(q) || seller.includes(q) || buyer.includes(q) || String(d.id).includes(q);
      });
    }
    return out;
  });

  readonly pendingRatingDeals = computed(() => {
    const me = this.auth.getCurrentUser()?.username;
    if (!me) return [];
    return this.deals().filter((d) => {
      if (normalizeDealStatus(d) !== 'RE') return false;
      if (d.buyer?.username !== me) return false;
      return d.buyer_has_rated === false;
    });
  });

  ngOnInit(): void {
    this.loadDeals();
  }

  private loadDeals(): void {
    this.loading.set(true);
    this.dealService.getDeals().subscribe({
      next: (d) => {
        this.deals.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setFilter(f: FilterTab): void {
    this.filter.set(f);
  }

  setSearch(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.search.set(v);
  }

  dealPrice(d: Deal): string {
    return String(d.price ?? d.product_price ?? '0');
  }

  statusOf(d: Deal) {
    return normalizeDealStatus(d);
  }

  openRatingModal(d: Deal): void {
    this.ratingDeal.set(d);
  }

  closeRatingModal(): void {
    this.ratingDeal.set(null);
  }

  skipRating(): void {
    this.closeRatingModal();
  }

  submitDashboardRating(ev: { score: number; comment: string }): void {
    const d = this.ratingDeal();
    if (!d) return;
    this.dealService.submitRating({ deal_id: d.id, score: ev.score, comment: ev.comment }).subscribe({
      next: () => {
        this.toast.success('Thank you for your rating.');
        this.closeRatingModal();
        this.loadDeals();
      },
      error: () => undefined
    });
  }

  clearFilters(): void {
    this.filter.set('all');
    this.search.set('');
  }
}
