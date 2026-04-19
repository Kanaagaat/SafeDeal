import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

function flattenDjangoError(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const parts: string[] = [];
  const walk = (val: unknown, prefix = ''): void => {
    if (typeof val === 'string') {
      parts.push(prefix ? `${prefix}: ${val}` : val);
      return;
    }
    if (Array.isArray(val)) {
      val.forEach((v) => walk(v, prefix));
      return;
    }
    if (val && typeof val === 'object') {
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}.${k}` : k);
      }
    }
  };
  walk(body);
  return parts.length ? parts.join(' ') : null;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const skipToast =
    req.url.includes('/login/') ||
    req.url.includes('/register/') ||
    req.url.includes('/token/refresh/');

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }
      if (skipToast) {
        return throwError(() => err);
      }
      if (err.status === 401 && !req.url.includes('/token/refresh/')) {
        return throwError(() => err);
      }
      // 400 validation: handled inline in forms / action handlers
      if (err.status >= 500) {
        toast.error('A server error occurred. Please try again later.');
      } else if (err.status === 403 || err.status === 404) {
        const msg =
          (typeof err.error === 'object' && err.error && 'detail' in err.error
            ? String((err.error as { detail?: string }).detail)
            : null) ||
          flattenDjangoError(err.error) ||
          (err.status === 404 ? 'Not found.' : 'Access denied.');
        toast.error(msg);
      }
      return throwError(() => err);
    })
  );
};
