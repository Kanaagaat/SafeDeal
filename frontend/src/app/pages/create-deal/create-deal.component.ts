import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DealService } from '../../core/services/deal.service';
import { ToastService } from '../../core/services/toast.service';

function minPriceGreaterThanZero(c: AbstractControl): ValidationErrors | null {
  const raw = c.value;
  if (raw === '' || raw === null || raw === undefined) return null;
  const v = parseFloat(String(raw).replace(',', '.'));
  if (Number.isNaN(v) || v <= 0) return { minPrice: true };
  return null;
}

@Component({
  selector: 'app-create-deal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-deal.component.html',
  styleUrls: ['./create-deal.component.scss']
})
export class CreateDealComponent {
  private readonly fb = inject(FormBuilder);
  private readonly deals = inject(DealService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  serverError = '';
  fieldErrors: Record<string, string> = {};

  form = this.fb.nonNullable.group({
    product_name: ['', [Validators.required, Validators.minLength(3)]],
    product_description: ['', Validators.required],
    product_price: [
      '',
      [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/), minPriceGreaterThanZero]
    ],
    buyer: ['', Validators.required]
  });

  submit(): void {
    this.serverError = '';
    this.fieldErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.deals
      .createDeal({
        product_name: v.product_name,
        product_description: v.product_description,
        product_price: v.product_price,
        buyer: v.buyer.trim()
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Deal created successfully!');
          this.form.reset();
          void this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.applyFieldErrors(err);
          if (!Object.keys(this.fieldErrors).length) {
            this.serverError = this.flatten(err) || 'Could not create deal.';
          }
        }
      });
  }

  private applyFieldErrors(err: HttpErrorResponse): void {
    const e = err.error;
    if (!e || typeof e !== 'object') return;
    for (const [key, val] of Object.entries(e)) {
      if (Array.isArray(val) && val.length) {
        this.fieldErrors[key] = String(val[0]);
      } else if (typeof val === 'string') {
        this.fieldErrors[key] = val;
      }
    }
  }

  private flatten(err: HttpErrorResponse): string {
    const e = err.error;
    if (!e || typeof e !== 'object') return typeof e === 'string' ? e : '';
    const parts: string[] = [];
    for (const [k, val] of Object.entries(e)) {
      if (Array.isArray(val)) parts.push(`${k}: ${val.join(' ')}`);
      else if (typeof val === 'string') parts.push(`${k}: ${val}`);
    }
    return parts.join(' ');
  }
}
