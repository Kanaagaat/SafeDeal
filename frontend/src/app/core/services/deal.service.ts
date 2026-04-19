import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DealStatusCode } from '../utils/deal-status';

export interface DealParty {
  id?: number;
  username: string;
  trust_score: number;
}

export interface Deal {
  id: number;
  product_name: string;
  product_description: string;
  product_price: string;
  deal_status: DealStatusCode;
  buyer: DealParty;
  seller: DealParty;
  /** Present for buyer on RELEASED deals from API */
  buyer_has_rated?: boolean | null;
  title?: string;
  description?: string;
  price?: string;
  status?: DealStatusCode;
  buyer_confirmed?: boolean;
  seller_confirmed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDealPayload {
  product_name: string;
  product_description: string;
  product_price: string | number;
  buyer: string;
}

@Injectable({ providedIn: 'root' })
export class DealService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getDeals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${this.api}/deals/`).pipe(catchError(() => of([])));
  }

  getDeal(id: number): Observable<Deal> {
    return this.http.get<Deal>(`${this.api}/deals/${id}/`);
  }

  createDeal(data: CreateDealPayload): Observable<Deal> {
    return this.http.post<Deal>(`${this.api}/deals/`, data);
  }

  cancelDeal(id: number): Observable<Deal> {
    return this.http
      .post<{ deal: Deal }>(`${this.api}/deals/${id}/cancel-deal/`, {})
      .pipe(map((r) => r.deal));
  }

  confirmDelivery(id: number): Observable<Deal> {
    return this.http
      .post<{ deal: Deal; message?: string }>(`${this.api}/deals/${id}/confirm-delivery/`, {})
      .pipe(map((r) => r.deal));
  }

  sellerConfirm(id: number): Observable<Deal> {
    return this.http
      .post<{ deal: Deal; message?: string }>(`${this.api}/deals/${id}/seller-confirm/`, {})
      .pipe(map((r) => r.deal));
  }

  openDispute(id: number): Observable<Deal> {
    return this.http
      .post<{ deal: Deal; message?: string }>(`${this.api}/deals/${id}/open-dispute/`, {})
      .pipe(map((r) => r.deal));
  }

  submitRating(payload: { deal_id: number; score: number; comment: string }): Observable<unknown> {
    return this.http.post(`${this.api}/ratings/`, payload);
  }
}
