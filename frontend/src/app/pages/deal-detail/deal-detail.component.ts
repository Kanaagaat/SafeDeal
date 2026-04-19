import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { interval } from 'rxjs';
import { DealService, Deal } from '../../core/services/deal.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { WalletService } from '../../core/services/wallet.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { RatingPromptModalComponent } from '../../shared/components/rating-prompt-modal/rating-prompt-modal.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import {
  normalizeDealStatus,
  TIMELINE_STEPS,
  timelineProgressIndex,
  DealStatusCode
} from '../../core/utils/deal-status';

type ModalKind = 'none' | 'pay' | 'cancel' | 'dispute';

@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent,
    ConfirmationModalComponent,
    SkeletonLoaderComponent,
    RatingPromptModalComponent,
    RelativeTimePipe
  ],
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss']
})
export class DealDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly deals = inject(DealService);
  private readonly tx = inject(TransactionService);
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly wallet = inject(WalletService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly deal = signal<Deal | null>(null);
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly modal = signal<ModalKind>('none');
  readonly ratingModalOpen = signal(false);
  readonly buyerHasRated = signal(false);
  readonly ratingPromptDismissed = signal(false);
  /** Prevents re-opening the rating modal on every poll */
  private readonly ratingAutoOpened = signal(false);
  copyHint = '';

  readonly steps = TIMELINE_STEPS;

  readonly currentUser = computed(() => this.auth.getCurrentUser());
  readonly status = computed(() => normalizeDealStatus(this.deal() || {}));

  readonly isBuyer = computed(() => {
    const d = this.deal();
    const u = this.currentUser();
    if (!d || !u) return false;
    return d.buyer.username === u.username;
  });

  readonly isSeller = computed(() => {
    const d = this.deal();
    const u = this.currentUser();
    if (!d || !u) return false;
    return d.seller.username === u.username;
  });

  readonly timelineIdx = computed(() => timelineProgressIndex(this.status()));

  readonly payModalDetail = computed(() => {
    const d = this.deal();
    if (!d) return '';
    return `Amount: $${this.priceLabel(d)}\nSeller: ${d.seller.username}\nBuyer: ${d.buyer.username}`;
  });

  readonly cancelModalDetail = computed(() => {
    const d = this.deal();
    if (!d) return '';
    return `Counterparty: ${this.isBuyer() ? d.seller.username : d.buyer.username}\nAmount: $${this.priceLabel(d)}`;
  });

  readonly disputeModalDetail = computed(() => {
    const d = this.deal();
    if (!d) return '';
    return `Seller: ${d.seller.username}\nBuyer: ${d.buyer.username}\nEscrow: $${this.priceLabel(d)}`;
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      const id = p.get('id');
      if (id) {
        this.ratingPromptDismissed.set(false);
        this.ratingAutoOpened.set(false);
        this.loadDeal(+id, true);
      }
    });

    interval(10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const id = this.deal()?.id;
        if (id) this.loadDeal(id, false);
      });
  }

  loadDeal(id: number, showSkeleton: boolean): void {
    if (showSkeleton) this.loading.set(true);
    this.deals.getDeal(id).subscribe({
      next: (d) => {
        this.deal.set(d);
        this.loading.set(false);
        this.afterDealLoaded(d);
      },
      error: () => this.loading.set(false)
    });
  }

  manualRefresh(): void {
    const id = this.deal()?.id;
    if (id) this.loadDeal(id, false);
  }

  private afterDealLoaded(d: Deal): void {
    this.checkRatedState(d);
    this.maybeOpenRatingModal(d);
  }

  private checkRatedState(d: Deal): void {
    const sellerId = d.seller.id;
    const me = this.currentUser();
    if (d.buyer_has_rated === true) {
      this.buyerHasRated.set(true);
      return;
    }
    if (d.buyer_has_rated === false) {
      this.buyerHasRated.set(false);
      return;
    }
    if (!sellerId || !me || !this.isBuyer() || normalizeDealStatus(d) !== 'RE') {
      this.buyerHasRated.set(false);
      return;
    }
    this.users.getRatings(sellerId).subscribe({
      next: (list) => {
        const hit = list.some((r) => r.deal === d.id && r.reviewer_id === me.id);
        this.buyerHasRated.set(hit);
      },
      error: () => this.buyerHasRated.set(false)
    });
  }

  private maybeOpenRatingModal(d: Deal): void {
    if (this.ratingPromptDismissed() || this.ratingAutoOpened()) return;
    if (!this.isBuyer() || normalizeDealStatus(d) !== 'RE') return;
    if (this.buyerHasRated()) return;
    if (d.buyer_has_rated === true) return;
    this.ratingModalOpen.set(true);
    this.ratingAutoOpened.set(true);
  }

  progressPercent(): string {
    const idx = this.timelineIdx();
    if (idx < 0) return '0%';
    if (idx <= 0) return '0%';
    return `${((idx / (this.steps.length - 1)) * 100).toFixed(0)}%`;
  }

  stepDone(i: number): boolean {
    const idx = this.timelineIdx();
    if (idx < 0) return false;
    return i <= idx;
  }

  showPay(): boolean {
    return this.isBuyer() && this.status() === 'CR';
  }

  showCancel(): boolean {
    return (this.isBuyer() || this.isSeller()) && this.status() === 'CR';
  }

  showConfirmDelivery(): boolean {
    return this.isBuyer() && this.status() === 'SH';
  }

  showSellerConfirm(): boolean {
    return this.isSeller() && this.status() === 'DE';
  }

  showDispute(): boolean {
    return this.status() === 'SH' || this.status() === 'DE';
  }

  showRateEntry(): boolean {
    return this.isBuyer() && this.status() === 'RE' && !this.buyerHasRated() && !this.ratingModalOpen();
  }

  openModal(m: ModalKind): void {
    this.modal.set(m);
  }

  closeModal(): void {
    this.modal.set('none');
  }

  private touchWallet(): void {
    this.wallet.refreshBalance().subscribe({ error: () => undefined });
  }

  confirmPay(): void {
    const d = this.deal();
    if (!d) return;
    this.acting.set(true);
    this.closeModal();
    const amount = String(d.product_price ?? d.price ?? '');
    this.tx.pay(d.id, amount).subscribe({
      next: () => {
        this.toast.success('Payment successful. Deal is now in shipped status.');
        this.touchWallet();
        this.loadDeal(d.id, false);
        this.acting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.acting.set(false);
        const msg = this.flattenErr(err);
        if (msg) this.toast.error(msg);
      }
    });
  }

  confirmCancel(): void {
    const d = this.deal();
    if (!d) return;
    this.acting.set(true);
    this.closeModal();
    this.deals.cancelDeal(d.id).subscribe({
      next: () => {
        this.toast.success('Deal cancelled.');
        this.touchWallet();
        this.loadDeal(d.id, false);
        this.acting.set(false);
      },
      error: () => this.acting.set(false)
    });
  }

  confirmDispute(): void {
    const d = this.deal();
    if (!d) return;
    this.acting.set(true);
    this.closeModal();
    this.deals.openDispute(d.id).subscribe({
      next: () => {
        this.toast.success('Dispute opened.');
        this.touchWallet();
        this.loadDeal(d.id, false);
        this.acting.set(false);
      },
      error: () => this.acting.set(false)
    });
  }

  confirmDelivery(): void {
    const d = this.deal();
    if (!d) return;
    this.acting.set(true);
    this.deals.confirmDelivery(d.id).subscribe({
      next: () => {
        this.toast.success('Delivery confirmed.');
        this.touchWallet();
        this.loadDeal(d.id, false);
        this.acting.set(false);
      },
      error: () => this.acting.set(false)
    });
  }

  sellerConfirm(): void {
    const d = this.deal();
    if (!d) return;
    this.acting.set(true);
    this.deals.sellerConfirm(d.id).subscribe({
      next: () => {
        this.toast.success('Seller confirmation recorded.');
        this.touchWallet();
        this.loadDeal(d.id, false);
        this.acting.set(false);
      },
      error: () => this.acting.set(false)
    });
  }

  openRatingFromButton(): void {
    this.ratingModalOpen.set(true);
  }

  skipRatingModal(): void {
    this.ratingModalOpen.set(false);
    this.ratingPromptDismissed.set(true);
  }

  submitRatingModal(ev: { score: number; comment: string }): void {
    const d = this.deal();
    if (!d) return;
    this.acting.set(true);
    this.deals.submitRating({ deal_id: d.id, score: ev.score, comment: ev.comment || '' }).subscribe({
      next: () => {
        this.toast.success('Thank you for your rating.');
        this.ratingModalOpen.set(false);
        this.buyerHasRated.set(true);
        this.loadDeal(d.id, false);
        this.acting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.acting.set(false);
        const msg = this.flattenErr(err);
        if (msg) this.toast.error(msg);
      }
    });
  }

  copyDealId(): void {
    const id = this.deal()?.id;
    if (id == null) return;
    void navigator.clipboard.writeText(String(id)).then(
      () => {
        this.copyHint = 'Copied!';
        setTimeout(() => (this.copyHint = ''), 2000);
      },
      () => this.toast.error('Could not copy to clipboard.')
    );
  }

  private flattenErr(err: HttpErrorResponse): string | null {
    const e = err.error;
    if (!e || typeof e !== 'object') return typeof e === 'string' ? e : null;
    const parts: string[] = [];
    for (const val of Object.values(e)) {
      if (Array.isArray(val)) parts.push(val.join(' '));
      else if (typeof val === 'string') parts.push(val);
    }
    return parts.length ? parts.join(' ') : null;
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  }

  priceLabel(d: Deal): string {
    return String(d.price ?? d.product_price ?? '0');
  }

  statusForBadge(d: Deal | null): DealStatusCode {
    return normalizeDealStatus(d || {});
  }
}
