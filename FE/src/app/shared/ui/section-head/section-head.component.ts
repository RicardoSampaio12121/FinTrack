import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-section-head',
  standalone: true,
  template: `
    <div class="section-head">
      <h3 class="section-head__title">{{ title() }}</h3>
      @if (actionLabel()) {
        <button class="section-head__action" (click)="actionClick.emit()" type="button">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .section-head__title {
      font-family: var(--font-body);
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
    .section-head__action {
      font-family: var(--font-body);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-accent);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      &:hover { text-decoration: underline; }
    }
  `],
})
export class SectionHeadComponent {
  title       = input<string>('');
  actionLabel = input<string>('');
  actionClick = output<void>();
}
