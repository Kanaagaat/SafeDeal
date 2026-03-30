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
    // Uncomment when backend ready:
    // this.dealService.createDeal(this.form).subscribe({
    //   next: () => this.router.navigate(['/dashboard']),
    //   error: () => { this.submitting = false; }
    // });

    setTimeout(() => {
      this.submitting = false;
      this.successMsg = 'Deal created successfully! Redirecting...';
      setTimeout(() => this.router.navigate(['/dashboard']), 1500);
    }, 800);
  }
}
