import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WalletService } from './wallet.service';

export interface TransactionRecord {
  id: number;
  transaction_type: string;
  amount: string | number;
  user: string;
  user_id: number;
  deal: string | null;
  deal_id: number | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly wallet = inject(WalletService);
  private readonly api = environment.apiUrl;

  getTransactions(): Observable<TransactionRecord[]> {
    return this.http.get<TransactionRecord[]>(`${this.api}/transactions/`);
  }

  pay(dealId: number, amount: number | string): Observable<unknown> {
    return this.http
      .post(`${this.api}/transactions/pay/`, {
        deal_id: dealId,
        amount
      })
      .pipe(switchMap((res) => this.wallet.refreshBalance().pipe(map(() => res))));
  }

  confirmTransaction(dealId: number): Observable<unknown> {
    return this.http.post(`${this.api}/transactions/confirm/`, { deal_id: dealId }).pipe(
      switchMap((res) => this.wallet.refreshBalance().pipe(map(() => res)))
    );
  }
}
