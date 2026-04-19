import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isPublicApiUrl(url: string): boolean {
  return (
    url.includes('/login/') ||
    url.includes('/register/') ||
    url.includes('/token/refresh/') ||
    url.includes('/logout/')
  );
}

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.currentToken();

  let outgoing = req;
  if (token && !isPublicApiUrl(req.url)) {
    outgoing = addToken(req, token);
  }

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      if (isPublicApiUrl(req.url) || req.url.includes('/token/refresh/')) {
        if (req.url.includes('/token/refresh/')) {
          void router.navigate(['/auth']);
        }
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);
        return auth.refreshToken().pipe(
          switchMap((res) => {
            isRefreshing = false;
            refreshTokenSubject.next(res.access);
            return next(addToken(req, res.access));
          }),
          catchError((e) => {
            isRefreshing = false;
            auth.logout();
            return throwError(() => e);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter((t): t is string => t !== null),
        take(1),
        switchMap((newToken) => next(addToken(req, newToken)))
      );
    })
  );
};
