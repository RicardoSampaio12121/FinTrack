import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': '"card card--" + padding()',
  },
  styles: [`
    :host {
      display: block;
      background: var(--color-surface);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }
    :host.card--none  { padding: 0; }
    :host.card--sm    { padding: var(--space-4); }
    :host.card--md    { padding: var(--space-5) var(--space-6); }
    :host.card--lg    { padding: var(--space-8); }
  `],
})
export class CardComponent {
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
}
