import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-rating-prompt-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rating-prompt-modal.component.html',
  styleUrls: ['./rating-prompt-modal.component.scss']
})
export class RatingPromptModalComponent {
  private readonly fb = inject(FormBuilder);

  @Input() open = false;
  @Input() sellerUsername = '';
  @Input() dealId: number | null = null;

  @Output() skipped = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ score: number; comment: string }>();

  readonly hoverScore = signal(0);

  form = this.fb.nonNullable.group({
    score: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['']
  });

  setScore(n: number): void {
    this.form.patchValue({ score: n });
    this.hoverScore.set(0);
  }

  setHover(n: number): void {
    this.hoverScore.set(n);
  }

  clearHover(): void {
    this.hoverScore.set(0);
  }

  displayScore(): number {
    const h = this.hoverScore();
    if (h > 0) return h;
    return this.form.controls.score.value;
  }

  skip(): void {
    this.skipped.emit();
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.submitted.emit({ score: v.score, comment: v.comment?.trim() || '' });
  }
}
