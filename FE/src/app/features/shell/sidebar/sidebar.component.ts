import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <nav class="sidebar" aria-label="Main navigation">

      <!-- Logo -->
      <div class="sidebar__logo">
        <app-logo />
      </div>

      <!-- Add Transaction -->
      <div class="sidebar__add-btn">
        <a
          class="sidebar__nav-item sidebar__nav-item--accent"
          [routerLink]="['/transactions']"
          [queryParams]="{ add: 'true' }"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add transaction
        </a>
      </div>

      <!-- Nav Items -->
      <div class="sidebar__nav">
        <a class="sidebar__nav-item" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </a>
        <a class="sidebar__nav-item" routerLink="/transactions" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Transactions
        </a>
        <a class="sidebar__nav-item" routerLink="/categories" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16"/><path d="M4 12h8"/><path d="M4 18h4"/><circle cx="18" cy="14" r="4"/><path d="m22 18-1.5-1.5"/></svg>
          Categories
        </a>
        <a class="sidebar__nav-item" routerLink="/goals" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          Goals
        </a>
        <a class="sidebar__nav-item" routerLink="/reports" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Reports
        </a>
      </div>

      <div class="sidebar__spacer"></div>

      <!-- User Card -->
      <div class="sidebar__user">
        <div class="sidebar__avatar">{{ initial() }}</div>
        <div class="sidebar__user-info">
          <div class="name">{{ user()?.displayName }}</div>
          <div class="email">{{ user()?.email }}</div>
        </div>
        <button class="sidebar__settings-btn" (click)="auth.logout()" title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar__nav-item--accent {
      background: var(--color-positive-bg);
      color: var(--color-positive);
      font-weight: var(--weight-semibold);
      margin-bottom: var(--space-1);

      &:hover {
        background: color-mix(in oklab, #2f7d5b 18%, transparent);
        color: var(--color-positive);
      }
      svg { opacity: 1; color: var(--color-positive); }
    }
  `],
})
export class SidebarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly user    = this.auth.currentUser;
  protected readonly initial = () => this.user()?.displayName?.[0]?.toUpperCase() ?? '?';
}
