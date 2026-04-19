import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealStatusCode, dealStatusLabel } from '../../../core/utils/deal-status';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="variantClass">{{ label }}</span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .cr {
        background: rgba(26, 86, 219, 0.25);
        color: var(--primary-light, #3b82f6);
      }
      .sh {
        background: rgba(6, 182, 212, 0.2);
        color: var(--accent, #06b6d4);
      }
      .de {
        background: rgba(16, 185, 129, 0.2);
        color: var(--success, #10b981);
      }
      .re {
        background: rgba(5, 150, 105, 0.28);
        color: #34d399;
      }
      .ca {
        background: rgba(148, 163, 184, 0.25);
        color: var(--text-muted, #94a3b8);
      }
      .di {
        background: rgba(239, 68, 68, 0.2);
        color: var(--danger, #ef4444);
      }
      .pa,
      .se {
        background: rgba(59, 130, 246, 0.15);
        color: #93c5fd;
      }
      .unknown {
        background: rgba(148, 163, 184, 0.2);
        color: #cbd5e1;
      }
    `
  ]
})
export class StatusBadgeComponent {
  @Input() set status(value: DealStatusCode | undefined) {
    this.code = (value || 'CR') as DealStatusCode;
    this.label = dealStatusLabel(this.code);
    this.variantClass = this.mapVariant(this.code);
  }

  label = 'CREATED';
  code: DealStatusCode = 'CR';
  variantClass = 'cr';

  private mapVariant(code: DealStatusCode): string {
    const c = String(code).toLowerCase();
    if (['cr', 'sh', 'de', 're', 'ca', 'di', 'pa', 'se'].includes(c)) return c;
    return 'unknown';
  }
}
