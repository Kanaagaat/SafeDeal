import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WalletData } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private api = `${environment.apiUrl}/api/wallet`;

  constructor(private http: HttpClient) {}

  getWallet(): Observable<WalletData> {
    return this.http.get<WalletData>(this.api);
  }

  addFunds(amount: number): Observable<WalletData> {
    return this.http.post<WalletData>(`${this.api}/deposit`, { amount });
  }
}
