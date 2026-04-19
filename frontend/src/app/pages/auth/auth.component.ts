import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WalletService } from '../../core/services/wallet.service';

function passwordsMatch(c: AbstractControl): ValidationErrors | null {
  const p = c.get('password')?.value;
  const c2 = c.get('confirmPassword')?.value;
  if (!p || !c2) return null;
  return p === c2 ? null : { mismatch: true };
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly wallet = inject(WalletService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<'login' | 'register'>('login');
  readonly submitting = signal(false);
  loginError = '';
  registerFieldErrors: Record<string, string> = {};
  registerFormError = '';

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm = this.fb.nonNullable.group(
    {
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  setMode(m: 'login' | 'register'): void {
    this.mode.set(m);
    this.loginError = '';
    this.registerFormError = '';
    this.registerFieldErrors = {};
  }

  submitLogin(): void {
    this.loginError = '';
    if (this.loginForm.invalid) {
      this.loginError = 'Please fill in all fields';
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.wallet.refreshBalance().subscribe({ error: () => undefined });
        const ret = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        void this.router.navigateByUrl(ret);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        const body = err.error;
        if (typeof body === 'string') {
          this.loginError = 'Invalid username or password';
          return;
        }
        const nonField =
          body?.non_field_errors?.[0] ||
          (Array.isArray(body?.non_field_errors) ? body.non_field_errors.join(' ') : '');
        if (
          typeof nonField === 'string' &&
          nonField.toLowerCase().includes('invalid username or password')
        ) {
          this.loginError = 'Invalid username or password';
          return;
        }
        if (body?.detail) {
          this.loginError = String(body.detail);
          return;
        }
        this.loginError = 'Invalid username or password';
      }
    });
  }

  submitRegister(): void {
    this.registerFieldErrors = {};
    this.registerFormError = '';
    if (this.registerForm.invalid) {
      if (this.registerForm.hasError('mismatch')) {
        this.registerFormError = 'Passwords do not match';
      } else {
        this.registerFormError = 'Please fill in all fields';
      }
      this.registerForm.markAllAsTouched();
      return;
    }
    const v = this.registerForm.getRawValue();
    this.submitting.set(true);
    this.auth
      .register({
        username: v.username,
        email: v.email,
        password: v.password,
        first_name: v.first_name,
        last_name: v.last_name
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Registration successful! Please log in.');
          this.registerForm.reset();
          this.setMode('login');
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const e = err.error;
          if (e && typeof e === 'object') {
            for (const [key, val] of Object.entries(e)) {
              const msg = Array.isArray(val) ? val.join(' ') : String(val);
              this.registerFieldErrors[key] = msg;
              if (key === 'username' && msg.toLowerCase().includes('already')) {
                this.registerFieldErrors['username'] = 'This username is already taken';
              }
            }
            if (Object.keys(this.registerFieldErrors).length === 0) {
              this.registerFormError = 'Registration could not be completed.';
            }
          } else {
            this.registerFormError = 'Registration could not be completed.';
          }
        }
      });
  }
}
