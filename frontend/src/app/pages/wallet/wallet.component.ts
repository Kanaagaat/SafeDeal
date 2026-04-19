import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WalletService } from '../../core/services/wallet.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  private readonly wallet = inject(WalletService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  balance = 0;
  escrow = 0;
  readonly modalOpen = signal(false);
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.wallet.refreshBalance().subscribe({
      next: (b) => {
        this.balance = b.balance;
        this.escrow = b.escrow_balance;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.form.reset();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  addFunds(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.controls.amount.value;
    const amount = parseFloat(raw);
    if (!(amount > 0)) return;
    this.submitting.set(true);
    this.wallet.addFunds(amount).subscribe({
      next: () => {
        this.toast.success('Funds added successfully!');
        this.submitting.set(false);
        this.closeModal();
        this.refresh();
      },
      error: () => this.submitting.set(false)
    });
  }
}
