// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    balance: number;
    escrow_balance: number;
    trust_score: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login/`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<any>(`${this.api}/register/`, data).pipe(
      tap(res => {
        if (res.access && res.user) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh || '');
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    // Try to get from subject first, fallback to localStorage
    const user = this.currentUserSubject.value;
    if (user) return user;
    
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.currentUserSubject.next(parsed);
      return parsed;
    }
    return null;
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/user/profile/`);
  }
  
  getBalance(): Observable<any> {
    return this.http.get(`${this.api}/user/balance/`);
  }
  
//   updateBalance(amount: number): Observable<any> {
//     return this.http.post<any>(`${this.api}/user/add-funds/', views.add_funds, name='add-funds'),
// ]`, { amount }).pipe(
//       tap(res => {
//         const user = this.getCurrentUser();
//         if (user) {
//           (user as any).balance = res.balance;
//           (user as any).escrow_balance = res.escrow_balance;
//           this.currentUserSubject.next(user);
//           localStorage.setItem('user', JSON.stringify(user));
//         }
//       })
//     );
//   }
  
  updateBalance(amount: number): Observable<any> {
    return this.http.post<any>(`${this.api}/user/add-funds/`, { amount }).pipe(
      tap(res => {
        const user = this.getCurrentUser();
        if (user) {
          user.balance = res.balance;
          user.escrow_balance = res.escrow_balance;
          this.currentUserSubject.next(user);
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }


  getUser(): any {
    return this.getCurrentUser();
  }
  
  updateUserData(): void {
    this.getProfile().subscribe({
      next: (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: (error: any) => console.error('Error updating user data:', error)
    });
  }
}