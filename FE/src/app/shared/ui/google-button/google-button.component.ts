import { Component } from '@angular/core';

@Component({
  selector: 'app-google-button',
  standalone: true,
  template: `
    <button class="google-btn" type="button" disabled title="Google sign-in coming soon">
      <span class="google-btn__icon">G</span>
      Continue with Google
    </button>
  `,
  styleUrl: './google-button.component.scss',
})
export class GoogleButtonComponent {}
