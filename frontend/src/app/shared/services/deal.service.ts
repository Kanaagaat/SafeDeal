import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Deal, CreateDealPayload } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DealService {
  private api = `${environment.apiUrl}/api/deals`;

  constructor(private http: HttpClient) {}

  getDeals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(this.api);
  }

  createDeal(payload: CreateDealPayload): Observable<Deal> {
    return this.http.post<Deal>(this.api, payload);
  }

  updateDeal(id: number, data: Partial<Deal>): Observable<Deal> {
    return this.http.put<Deal>(`${this.api}/${id}`, data);
  }

  deleteDeal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  payDeal(id: number): Observable<any> {
    return this.http.post(`${this.api}/${id}/pay`, {});
  }

  confirmDeal(id: number): Observable<any> {
    return this.http.post(`${this.api}/${id}/confirm`, {});
  }
}
