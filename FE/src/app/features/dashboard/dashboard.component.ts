import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-placeholder">
      <h1>Welcome, {{ authService.currentUser()?.displayName }}</h1>
      <p>Dashboard coming soon.</p>
      <button (click)="authService.logout()">Sign out</button>
    </div>
  `,
  styles: [`
    .dashboard-placeholder {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-family: var(--font-body);
      color: var(--color-text-primary);

      h1 { font-family: var(--font-display); font-size: var(--text-xl); }
      p { color: var(--color-text-muted); font-size: var(--text-sm); }

      button {
        margin-top: 8px;
        padding: 8px 20px;
        background: var(--color-accent);
        color: #fff;
        border: none;
        cursor: pointer;
        font-family: var(--font-body);
        font-size: var(--text-sm);
      }
    }
  `],
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
}
