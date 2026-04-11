import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { DealService, Deal } from '../../shared/services/deal.service';
import { AuthService } from '../../shared/services/auth.service';
import { WalletService } from '../../shared/services/wallet.service';
import { ToastService } from '../../shared/services/toast.service';
import { RatingDialogComponent, RatingDialogData } from '../../shared/components/rating-dialog/rating-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [CommonModule, RatingDialogComponent],
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss']
})
export class DealDetailComponent implements OnInit {
  deal$!: Observable<Deal>;
  currentUser: any = null;
  showRatingDialog = false;
  ratingDialogData: RatingDialogData | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealService: DealService,
    private walletService: WalletService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDeal();
  }

  private loadDeal(): void {
    this.deal$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = +params.get('id')!;
        return this.dealService.getDealById(id);
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  openDispute(deal: Deal): void {
    if (this.getDealStatus(deal) === 'DISPUTED') {
      this.toastService.info('A dispute is already open for this deal.');
      return;
    }

    this.dealService.openDispute(deal.id).subscribe({
      next: () => {
        this.reloadDeal(deal.id);
        this.toastService.success('Dispute opened successfully.');
      },
      error: (error) => {
        console.error('Error opening dispute:', error);
        this.toastService.error('Error opening dispute: ' + (error.error?.detail || error.error?.message || error.message || 'Please try again.'));
      }
    });
  }

  cancelDeal(deal: Deal): void {
    this.dealService.cancelDeal(deal.id).subscribe({
      next: () => {
        this.reloadDeal(deal.id);
        this.toastService.success('Deal cancelled successfully.');
      },
      error: (error) => {
        console.error('Error cancelling deal:', error);
        this.toastService.error('Error cancelling deal: ' + (error.error?.detail || error.error?.message || error.message || 'Please try again.'));
      }
    });
  }

  getDealStatus(deal: Deal): string {
    const rawStatus = ((deal as any).deal_status || deal.status || '').toString();
    const statusMap: Record<string, string> = {
      CR: 'CREATED',
      SH: 'SHIPPED',
      DE: 'DELIVERED',
      RE: 'RELEASED',
      DI: 'DISPUTED',
      CREATED: 'CREATED',
      SHIPPED: 'SHIPPED',
      DELIVERED: 'DELIVERED',
      RELEASED: 'RELEASED',
      DISPUTED: 'DISPUTED',
      CANCELLED: 'CANCELLED'
    };
    return statusMap[rawStatus] || rawStatus;
  }

  private isBuyer(deal: Deal): boolean {
    return this.currentUser?.username === deal.buyer.username;
  }

  private isSeller(deal: Deal): boolean {
    return this.currentUser?.username === deal.seller.username;
  }

  isPayVisible(deal: Deal): boolean {
    return this.getDealStatus(deal) === 'CREATED' && this.isBuyer(deal);
  }

  isConfirmDeliveryVisible(deal: Deal): boolean {
    const status = this.getDealStatus(deal);
    return (status === 'SHIPPED' || status === 'DELIVERED') && this.isBuyer(deal);
  }

  isSellerConfirmVisible(deal: Deal): boolean {
    return this.getDealStatus(deal) === 'DELIVERED' && this.isSeller(deal);
  }

  isCancelVisible(deal: Deal): boolean {
    return this.getDealStatus(deal) === 'CREATED';
  }

  isOpenDisputeVisible(deal: Deal): boolean {
    const status = this.getDealStatus(deal);
    return !['CREATED', 'RELEASED', 'CANCELLED'].includes(status);
  }

  isWaitingForOtherParty(deal: Deal): boolean {
    return (
      this.isBuyer(deal) && !!deal.buyer_confirmed && !deal.seller_confirmed
      || this.isSeller(deal) && !!deal.seller_confirmed && !deal.buyer_confirmed
    );
  }

  getConfirmDeliveryLabel(deal: Deal): string {
    if (!!deal.buyer_confirmed && !deal.seller_confirmed) {
      return 'Waiting for Seller Confirmation...';
    }
    return 'Confirm Delivery';
  }

  getSellerConfirmLabel(deal: Deal): string {
    if (!!deal.seller_confirmed && !deal.buyer_confirmed) {
      return 'Waiting for Buyer Confirmation...';
    }
    return 'Seller Confirm';
  }

  getOpenDisputeLabel(deal: Deal): string {
    return this.getDealStatus(deal) === 'DISPUTED' ? 'Dispute Open' : 'Open Dispute';
  }

  pay(deal: Deal): void {
    this.walletService.payForDeal(deal.id, deal.price).subscribe({
      next: () => {
        this.refreshBalances();
        this.reloadDeal(deal.id);
        this.toastService.success('Payment completed. The deal has moved to shipped status.');
      },
      error: (error) => {
        console.error('Error paying for deal:', error);
        this.toastService.error('Error paying for deal: ' + (error.error?.detail || error.error?.message || error.message || 'Please try again.'));
      }
    });
  }

  confirmDelivery(deal: Deal): void {
    if (this.isWaitingForOtherParty(deal)) {
      this.toastService.info('Waiting for seller confirmation.');
      return;
    }

    this.dealService.confirmDelivery(deal.id).subscribe({
      next: (updatedDeal) => {
        this.refreshBalances();
        this.reloadDeal(deal.id);

        if (this.isBuyer(deal)) {
          this.ratingDialogData = {
            dealId: deal.id,
            toUser: deal.seller.username,
            dealPrice: deal.price
          };
          this.showRatingDialog = true;
        }
        this.toastService.success('Delivery confirmed. Waiting for release or seller confirmation.');
      },
      error: (error) => {
        console.error('Error confirming delivery:', error);
        this.toastService.error('Error confirming delivery: ' + (error.error?.detail || error.error?.message || error.message || 'Please try again.'));
      }
    });
  }

  sellerConfirm(deal: Deal): void {
    if (this.isWaitingForOtherParty(deal)) {
      this.toastService.info('Waiting for buyer confirmation.');
      return;
    }

    this.dealService.sellerConfirm(deal.id).subscribe({
      next: () => {
        this.refreshBalances();
        this.reloadDeal(deal.id);
        this.toastService.success('Seller confirmation submitted. Waiting for buyer confirmation.');
      },
      error: (error) => {
        console.error('Error confirming deal as seller:', error);
        this.toastService.error('Error confirming deal: ' + (error.error?.detail || error.error?.message || error.message || 'Please try again.'));
      }
    });
  }

  closeRatingDialog(): void {
    this.showRatingDialog = false;
    this.ratingDialogData = null;
    // Refresh deals list
    this.router.navigate(['/dashboard']);
  }

  getStatusSteps(deal: Deal): { label: string; code: string; completed: boolean }[] {
    const steps = [
      { label: 'Created', code: 'CREATED' },
      { label: 'Shipped', code: 'SHIPPED' },
      { label: 'Delivered', code: 'DELIVERED' },
      { label: 'Released', code: 'RELEASED' },
      { label: 'Disputed', code: 'DISPUTED' }
    ];

    const currentStatus = this.getDealStatus(deal);

    return steps.map(step => ({
      ...step,
      completed: this.isStepCompleted(step.code, currentStatus)
    }));
  }

  private isStepCompleted(stepCode: string, currentStatus: string): boolean {
    const order = ['CREATED', 'SHIPPED', 'DELIVERED', 'RELEASED', 'DISPUTED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepCode);
    return stepIndex <= currentIndex && currentIndex >= 0;
  }

  private reloadDeal(id: number): void {
    this.deal$ = this.dealService.getDealById(id);
  }

  private refreshBalances(): void {
    this.authService.syncBalance().subscribe({
      next: () => {},
      error: (error) => console.error('Error updating balance:', error)
    });
  }
}