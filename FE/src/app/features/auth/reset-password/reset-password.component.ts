import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

export interface PasswordRule {
  label: string;
  ok: boolean;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, ButtonComponent, LogoComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = signal(false);
  serverError = signal<string | null>(null);
  token = signal<string | null>(null);
  private readonly passwordValue = signal('');

  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  passwordRules = computed<PasswordRule[]>(() => {
    const pw = this.passwordValue();
    return [
      { label: '6+ characters', ok: pw.length >= 6 },
      { label: 'a number', ok: /\d/.test(pw) },
      { label: 'a symbol', ok: /[^a-zA-Z0-9]/.test(pw) },
    ];
  });

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    this.form.controls.newPassword.valueChanges.subscribe((v) => this.passwordValue.set(v ?? ''));
  }

  get newPasswordError(): string | null {
    const ctrl = this.form.controls.newPassword;
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
    if (this.form.invalid || this.loading() || !this.token()) return;
    this.serverError.set(null);
    this.loading.set(true);

    this.authService
      .resetPassword({ token: this.token()!, newPassword: this.form.getRawValue().newPassword! })
      .subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: (err) => {
          this.loading.set(false);
          this.serverError.set(err.error?.message ?? 'This link is invalid or has expired.');
        },
      });
  }
}
