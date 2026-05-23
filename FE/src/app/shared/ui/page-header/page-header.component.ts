import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-6);
      flex-wrap: wrap;
    }
    .page-header__title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
      line-height: var(--leading-tight);
    }
    .page-header__subtitle {
      margin: 4px 0 0;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .page-header__actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
  `],
})
export class PageHeaderComponent {
  title    = input<string>('');
  subtitle = input<string>('');
}
