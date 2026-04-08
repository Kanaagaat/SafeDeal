import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const passwordConfirm = group.get('passwordConfirm')?.value;
    
    return password === passwordConfirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        first_name: this.registerForm.get('firstName')?.value,
        last_name: this.registerForm.get('lastName')?.value
      };

      this.authService.register(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.error && typeof error.error === 'object') {
            // Handle validation errors
            const errors = error.error;
            let errorMessage = '';
            
            if (errors.username) {
              errorMessage += (Array.isArray(errors.username) ? errors.username[0] : errors.username) + '. ';
            }
            if (errors.email) {
              errorMessage += (Array.isArray(errors.email) ? errors.email[0] : errors.email) + '. ';
            }
            if (errors.password) {
              errorMessage += (Array.isArray(errors.password) ? errors.password[0] : errors.password) + '. ';
            }
            
            this.errorMessage = errorMessage.trim() || 'Ошибка при регистрации';
          } else {
            this.errorMessage = 'Ошибка при регистрации. Попробуйте снова.';
          }
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
