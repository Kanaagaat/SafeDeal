import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();
  private nextId = 1;
  private readonly defaultDuration = 4000;
  private lastToastKey = '';
  private lastToastAt = 0;

  show(message: string, type: ToastType = 'info', duration = this.defaultDuration): void {
    const key = `${type}:${message}`;
    const now = Date.now();
    if (key === this.lastToastKey && now - this.lastToastAt < 2000) {
      return;
    }
    this.lastToastKey = key;
    this.lastToastAt = now;

    const toast: ToastMessage = {
      id: this.nextId++,
      type,
      message
    };
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string, duration = this.defaultDuration): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = this.defaultDuration): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = this.defaultDuration): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    const current = this.messagesSubject.value;
    this.messagesSubject.next(current.filter((t) => t.id !== id));
  }
}
