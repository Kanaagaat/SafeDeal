// services/deal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Deal {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  buyer: {
    username: string;
    trust_score: number;
  };
  seller: {
    username: string;
    trust_score: number;
  };
}

export interface Rating {
  id?: number;
  deal_id: number;
  from_user?: string;
  to_user?: string;
  rating_score?: number;
  score?: number;
  reviewer?: string;
  reviewed_user?: string;
  comment?: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class DealService {
  private api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getDeals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${this.api}/deals/`);
  }

  getDealById(id: number): Observable<Deal> {
    return this.http.get<Deal>(`${this.api}/deals/${id}/`);
  }

  createDeal(dealData: any): Observable<Deal> {
    return this.http.post<Deal>(`${this.api}/deals/`, dealData);
  }

  updateDealStatus(id: number, status: string): Observable<Deal> {
    return this.http.put<Deal>(`${this.api}/deals/${id}/`, { status });
  }
  
  confirmDelivery(id: number): Observable<Deal> {
    return this.http.post<Deal>(`${this.api}/deals/${id}/confirm-delivery/`, {});
  }

  createRating(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(`${this.api}/ratings/`, rating);
  }
  
  getRating(dealId: number, fromUser: string, toUser: string): Observable<Rating | null> {
    return this.http.get<Rating | null>(`${this.api}/ratings/?deal=${dealId}&from_user=${fromUser}&to_user=${toUser}`);
  }

  cancelDeal(id: number): Observable<any> {
    return this.http.delete(`${this.api}/deals/${id}/`);
  }
}