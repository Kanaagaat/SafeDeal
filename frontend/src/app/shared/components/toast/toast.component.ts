import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(toastService.messages$ | async) as messages">
      <div class="toast" *ngFor="let toast of messages" [ngClass]="toast.type">
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="toastService.dismiss(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [
    `
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 10000;
      max-width: 320px;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
      color: #fff;
      font-weight: 600;
      animation: toast-slide 0.3s ease;
    }

    .toast.success { background: #10b981; }
    .toast.error { background: #ef4444; }
    .toast.info { background: #3b82f6; }
    .toast.warning { background: #f59e0b; }

    .toast-message {
      flex: 1;
      word-break: break-word;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.85);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }

    @keyframes toast-slide {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    `
  ]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
