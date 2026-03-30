import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  // Temporarily allow all access for development
  // When login page is ready, uncomment the block below:
  //
  // const auth = inject(AuthService);
  // const router = inject(Router);
  // if (auth.isLoggedIn()) return true;
  // router.navigate(['/login']);
  // return false;

  return true;
};
