import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';
import { GoogleButtonComponent } from '../../../shared/ui/google-button/google-button.component';
import { DividerComponent } from '../../../shared/ui/divider/divider.component';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormFieldComponent,
    ButtonComponent,
    LogoComponent,
    GoogleButtonComponent,
    DividerComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  serverError = signal<string | null>(null);

  form = this.fb.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatch }
  );

  get displayNameError(): string | null {
    const ctrl = this.form.controls.displayName;
    if (!ctrl.dirty) return null;
    if (ctrl.hasError('required')) return 'Name is required';
    if (ctrl.hasError('minlength')) return 'Name must be at least 2 characters';
    return null;
  }

  get emailError(): string | null {
    const ctrl = this.form.controls.email;
    if (!ctrl.dirty) return null;
    if (ctrl.hasError('required')) return 'Email is required';
    if (ctrl.hasError('email')) return 'Enter a valid email';
    return null;
  }

  get passwordError(): string | null {
    const ctrl = this.form.controls.password;
    if (!ctrl.dirty) return null;
    if (ctrl.hasError('required')) return 'Password is required';
    if (ctrl.hasError('minlength')) return 'Password must be at least 6 characters';
    return null;
  }

  get confirmPasswordError(): string | null {
    const ctrl = this.form.controls.confirmPassword;
    if (!ctrl.dirty) return null;
    if (ctrl.hasError('required')) return 'Please confirm your password';
    if (this.form.hasError('passwordMismatch')) return 'Passwords do not match';
    return null;
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.serverError.set(null);
    this.loading.set(true);

    const { displayName, email, password } = this.form.getRawValue();
    this.authService.register({ displayName: displayName!, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }
}
