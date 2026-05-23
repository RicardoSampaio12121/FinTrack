import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-seg-toggle',
  standalone: true,
  template: `
    <div class="seg">
      @for (opt of options(); track opt) {
        <button
          class="seg__btn"
          [class.seg__btn--active]="value() === opt"
          (click)="select(opt)"
          type="button"
        >{{ opt }}</button>
      }
    </div>
  `,
  styles: [`
    .seg {
      display: inline-flex;
      background: var(--color-fill);
      border-radius: var(--radius-btn);
      padding: 3px;
      gap: 2px;
    }
    .seg__btn {
      padding: 5px 14px;
      border: none;
      border-radius: 6px;
      background: transparent;
      font-family: var(--font-body);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
      white-space: nowrap;
    }
    .seg__btn--active {
      background: var(--color-surface);
      color: var(--color-text-primary);
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }
  `],
})
export class SegToggleComponent {
  options     = input<string[]>([]);
  value       = input<string>('');
  valueChange = output<string>();

  select(opt: string): void {
    this.valueChange.emit(opt);
  }
}
