import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { DealService, Deal } from '../../shared/services/deal.service';
import { AuthService } from '../../shared/services/auth.service';
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
  showRatingDialog = false;
  ratingDialogData: RatingDialogData | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealService: DealService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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

  confirmDelivery(deal: Deal): void {
    if (!confirm('Are you sure you want to confirm delivery and release funds to the seller?')) {
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    
    this.dealService.confirmDelivery(deal.id).subscribe({
      next: (updatedDeal) => {
        console.log('Delivery confirmed', updatedDeal);
        
        // Determine who should rate whom
        const toUser = currentUser.username === deal.buyer.username 
          ? deal.seller.username 
          : deal.buyer.username;
        
        // Show rating dialog
        this.ratingDialogData = {
          dealId: deal.id,
          toUser: toUser,
          dealPrice: deal.price
        };
        this.showRatingDialog = true;
      },
      error: (error) => {
        console.error('Error confirming delivery:', error);
        alert('Error confirming delivery: ' + (error.error?.detail || error.error?.message || error.message));
      }
    });
  }

  closeRatingDialog(): void {
    this.showRatingDialog = false;
    this.ratingDialogData = null;
    // Refresh deals list
    this.router.navigate(['/dashboard']);
  }

  openDispute(deal: Deal): void {
    console.log('Open dispute for deal', deal.id);
  }

  getStatusSteps(deal: Deal): { label: string; code: string; completed: boolean }[] {
    const steps = [
      { label: 'Created', code: 'CR' },
      { label: 'Paid', code: 'PA' },
      { label: 'Secured', code: 'SE' },
      { label: 'Shipped', code: 'SH' },
      { label: 'Delivered', code: 'DE' },
      { label: 'Released', code: 'RE' }
    ];

    return steps.map(step => ({
      ...step,
      completed: this.isStepCompleted(step.code, deal.status)
    }));
  }

  private isStepCompleted(stepCode: string, currentStatus: string): boolean {
    const order = ['CR', 'PA', 'SE', 'SH', 'DE', 'RE'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepCode);
    return stepIndex <= currentIndex;
  }
}