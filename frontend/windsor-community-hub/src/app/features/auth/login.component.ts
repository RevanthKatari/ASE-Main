import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  mode = signal<AuthMode>('login');
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    full_name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  heading = computed(() => (this.mode() === 'login' ? 'Sign in' : 'Create an account'));
  submitLabel = computed(() => (this.mode() === 'login' ? 'Sign in' : 'Register'));

  toggleMode(): void {
    this.mode.update((mode) => (mode === 'login' ? 'register' : 'login'));
    this.errorMessage.set(null);
  }

  submit(): void {
    if (this.mode() === 'register' && !this.form.controls.full_name.value.trim()) {
      this.form.controls.full_name.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, full_name } = this.form.getRawValue();
    this.isSubmitting.set(true);

    const request$ =
      this.mode() === 'login'
        ? this.authService.login({ email, password })
        : this.authService.register({ email, password, full_name: full_name.trim(), role: 'student' });

    request$
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.errorMessage.set(null);
          this.router.navigateByUrl('/listings');
        },
        error: (error) => {
          const fallback = this.mode() === 'login' ? 'Unable to sign in' : 'Unable to register';
          this.errorMessage.set(error?.error?.error ?? fallback);
        },
      });
  }
}

