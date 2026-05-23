import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pill',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': '"pill pill--" + tone()' },
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 100px;
      font-family: var(--font-body);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      line-height: 1.6;
      white-space: nowrap;
    }
    :host.pill--neutral  { background: var(--color-fill); color: var(--color-text-secondary); }
    :host.pill--positive { background: var(--color-positive-bg); color: var(--color-positive); }
    :host.pill--negative { background: var(--color-negative-bg); color: var(--color-negative); }
    :host.pill--outline  { background: transparent; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
  `],
})
export class PillComponent {
  tone = input<'neutral' | 'positive' | 'negative' | 'outline'>('neutral');
}
