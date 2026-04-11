import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private nextId = 1;

  show(message: string, type: ToastType = 'info', duration = 3000): void {
    const toast: ToastMessage = {
      id: this.nextId++,
      type,
      message
    };
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, toast]);

    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 3000): void {
    this.show(message, 'warning', duration);
  }

  dismiss(id: number): void {
    const current = this.messagesSubject.value;
    this.messagesSubject.next(current.filter(toast => toast.id !== id));
  }
}
