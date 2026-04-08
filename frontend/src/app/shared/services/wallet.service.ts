// services/wallet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getWallet(): Observable<any> {
    return this.http.get(`${this.api}/profile/`);
  }

  addFunds(amount: number): Observable<any> {
    return this.http.post(`${this.api}/add-funds/`, { amount });
  }

  payForDeal(dealId: number): Observable<any> {
    return this.http.post(`${this.api}/transactions/pay/`, { deal_id: dealId });
  }

  confirmDeal(dealId: number): Observable<any> {
    return this.http.post(`${this.api}/transactions/confirm/`, { deal_id: dealId });
  }
}