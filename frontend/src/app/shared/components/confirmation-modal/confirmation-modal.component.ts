import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop" *ngIf="open" (click)="onBackdrop($event)" role="dialog" aria-modal="true">
      <div class="panel" (click)="$event.stopPropagation()">
        <h2 class="title">{{ title }}</h2>
        <p class="msg">{{ message }}</p>
        <p class="detail" *ngIf="detail">{{ detail }}</p>
        <div class="actions">
          <button type="button" class="btn ghost" (click)="cancel.emit()">{{ cancelLabel }}</button>
          <button type="button" class="btn danger" *ngIf="variant === 'danger'" (click)="confirm.emit()">
            {{ confirmLabel }}
          </button>
          <button type="button" class="btn primary" *ngIf="variant !== 'danger'" (click)="confirm.emit()">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 9000;
        background: rgba(15, 23, 42, 0.72);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .panel {
        width: 100%;
        max-width: 420px;
        background: var(--surface-card, #1e293b);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
      }
      .title {
        margin: 0 0 0.75rem;
        font-family: var(--font-heading, syne, sans-serif);
        font-size: 1.25rem;
        color: var(--text-primary, #f1f5f9);
      }
      .msg {
        margin: 0 0 0.5rem;
        color: var(--text-muted, #94a3b8);
        line-height: 1.5;
        font-size: 0.95rem;
      }
      .detail {
        margin: 0 0 1.5rem;
        padding: 0.65rem 0.75rem;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(59, 130, 246, 0.25);
        color: #e2e8f0;
        font-size: 0.88rem;
        line-height: 1.45;
        white-space: pre-wrap;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      .btn {
        border: none;
        border-radius: 10px;
        padding: 0.55rem 1.1rem;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .ghost {
        background: transparent;
        color: var(--text-muted, #94a3b8);
      }
      .ghost:hover {
        color: var(--text-primary, #f1f5f9);
      }
      .primary {
        background: var(--primary, #1a56db);
        color: #fff;
      }
      .primary:hover {
        background: var(--primary-light, #3b82f6);
      }
      .danger {
        background: var(--danger, #ef4444);
        color: #fff;
      }
      .danger:hover {
        filter: brightness(1.08);
      }
    `
  ]
})
export class ConfirmationModalComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Input() message = '';
  @Input() detail = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() variant: 'primary' | 'danger' = 'primary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdrop(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.cancel.emit();
    }
  }
}
