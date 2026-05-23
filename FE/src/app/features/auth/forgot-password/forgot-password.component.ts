import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

type Step = 1 | 2;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, ButtonComponent, LogoComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  step = signal<Step>(1);
  loading = signal(false);
  submittedEmail = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailError(): string | null {
    const ctrl = this.form.controls.email;
    if (!ctrl.dirty) return null;
    if (ctrl.hasError('required')) return 'Email is required';
    if (ctrl.hasError('email')) return 'Enter a valid email';
    return null;
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const email = this.form.getRawValue().email!;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => this.afterSubmit(email),
      error: () => this.afterSubmit(email), // always advance — no enumeration
    });
  }

  private afterSubmit(email: string): void {
    this.submittedEmail.set(email);
    this.step.set(2);
    this.loading.set(false);
  }

  resend(): void {
    this.step.set(1);
    this.form.reset();
  }
}
