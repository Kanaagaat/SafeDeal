import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp as number;
    return Math.floor(Date.now() / 1000) >= exp;
  } catch {
    return true;
  }
}

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.currentToken();

  if (token && !isTokenExpired(token)) {
    return true;
  }

  void router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
  return false;
};
