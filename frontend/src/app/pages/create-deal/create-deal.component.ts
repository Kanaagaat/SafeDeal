import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DealService } from '../../shared/services/deal.service';
import { CreateDealPayload } from '../../shared/models/models';

@Component({
  selector: 'app-create-deal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-deal.component.html',
  styleUrls: ['./create-deal.component.scss']
})
export class CreateDealComponent {
  form: CreateDealPayload = { title: '', description: '', price: 0, buyerContact: '' };
  submitted = false;
  submitting = false;
  successMsg = '';

  constructor(private dealService: DealService, private router: Router) {}

  onSubmit(): void {
    this.submitted = true;
    if (!this.form.title || !this.form.price || !this.form.buyerContact) return;

    this.submitting = true;
    const dealData = {
      product_name: this.form.title,
      product_description: this.form.description,
      product_price: this.form.price,
      buyer: this.form.buyerContact // This will be the buyer ID or username
    };
    
    this.dealService.createDeal(dealData).subscribe({
      next: () => {
        this.submitting = false;
        this.successMsg = 'Deal created successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error creating deal:', error);
      }
    });
  }
}
