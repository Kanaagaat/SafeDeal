import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  balance: number;
  escrow_balance: number;
  trust_score: number;
  date_joined?: string;
}

export interface RatingDto {
  id: number;
  deal: number;
  reviewer: string;
  reviewer_id: number;
  reviewed_user: string;
  reviewed_user_id: number;
  score: number;
  comment: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/user/profile/`);
  }

  getRatings(userId: number): Observable<RatingDto[]> {
    return this.http
      .get<RatingDto[]>(`${this.api}/ratings/`, {
        params: { user_id: String(userId) }
      })
      .pipe(catchError(() => of([])));
  }
}
