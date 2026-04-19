import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface BalanceResponse {
  balance: number;
  escrow_balance: number;
  trust_score?: number;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = environment.apiUrl;

  private readonly balanceSubject = new BehaviorSubject<BalanceResponse>({
    balance: Number(this.auth.getCurrentUser()?.balance ?? 0),
    escrow_balance: Number(this.auth.getCurrentUser()?.escrow_balance ?? 0),
    trust_score: Number(this.auth.getCurrentUser()?.trust_score ?? 0)
  });

  /** Latest balances for navbar and wallet page */
  readonly balance$ = this.balanceSubject.asObservable();

  snapshot(): BalanceResponse {
    return this.balanceSubject.value;
  }

  /** GET /user/balance/ and push to balance$ + local user cache */
  refreshBalance(): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.api}/user/balance/`).pipe(
      tap((b) => {
        this.auth.updateLocalUserBalance(b.balance, b.escrow_balance);
        this.balanceSubject.next(b);
      })
    );
  }

  /**
   * Adds funds to the wallet balance.
   * TODO: Replace with Stripe PaymentIntent flow
   */
  addFunds(amount: number): Observable<BalanceResponse> {
    return this.http.post<BalanceResponse>(`${this.api}/user/add-funds/`, { amount }).pipe(
      tap((b) => {
        this.auth.updateLocalUserBalance(b.balance, b.escrow_balance);
        this.balanceSubject.next(b);
      })
    );
  }
}
