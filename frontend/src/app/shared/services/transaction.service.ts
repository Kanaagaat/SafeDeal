import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TransactionRecord {
  id: number;
  transaction_type: string;
  amount: number;
  deal: string | null;
  deal_id: number | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<TransactionRecord[]> {
    return this.http.get<TransactionRecord[]>(`${this.api}/transactions/`);
  }
}
