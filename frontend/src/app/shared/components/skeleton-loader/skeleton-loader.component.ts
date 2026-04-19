import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sk" [style.height.px]="height" [class.rounded]="rounded" aria-hidden="true"></div>
  `,
  styles: [
    `
      .sk {
        width: 100%;
        background: linear-gradient(
          90deg,
          rgba(51, 65, 85, 0.5) 0%,
          rgba(71, 85, 105, 0.75) 50%,
          rgba(51, 65, 85, 0.5) 100%
        );
        background-size: 200% 100%;
        animation: pulse 1.2s ease-in-out infinite;
        border-radius: 8px;
      }
      .rounded {
        border-radius: 999px;
      }
      @keyframes pulse {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `
  ]
})
export class SkeletonLoaderComponent {
  @Input() height = 16;
  @Input() rounded = false;
}
