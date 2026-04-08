import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealService, Rating } from '../../services/deal.service';
import { AuthService } from '../../services/auth.service';

export interface RatingDialogData {
  dealId: number;
  toUser: string;
  dealPrice: number;
}

@Component({
  selector: 'app-rating-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-dialog.component.html',
  styleUrls: ['./rating-dialog.component.scss']
})
export class RatingDialogComponent {
  @Input() data!: RatingDialogData;
  @Output() dialogClose = new EventEmitter<void>();

  rating: number = 5;
  comment: string = '';
  isSubmitting = false;
  submitted = false;

  constructor(
    private dealService: DealService,
    private authService: AuthService
  ) {}

  setRating(stars: number): void {
    this.rating = stars;
  }

  submitRating(): void {
    this.isSubmitting = true;
    const currentUser = this.authService.getCurrentUser();

    const ratingData: any = {
      deal_id: this.data.dealId,
      reviewer: currentUser.username,
      reviewed_user: this.data.toUser,
      score: this.rating,
      comment: this.comment || ''
    };

    this.dealService.createRating(ratingData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted = true;
        setTimeout(() => {
          this.closeDialog();
        }, 1500);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Error submitting rating:', error);
      }
    });
  }

  closeDialog(): void {
    this.dialogClose.emit();
  }
}
