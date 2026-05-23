import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  standalone: true,
  template: `
    <button
      class="toggle"
      [class.toggle--on]="checked()"
      [disabled]="disabled()"
      (click)="toggle()"
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
    >
      <span class="toggle__thumb"></span>
    </button>
  `,
  styles: [`
    .toggle {
      display: inline-flex;
      align-items: center;
      width: 36px;
      height: 20px;
      background: var(--color-fill);
      border: 1px solid var(--color-border);
      border-radius: 100px;
      cursor: pointer;
      padding: 0 2px;
      transition: background var(--transition-fast), border-color var(--transition-fast);
      flex-shrink: 0;
    }
    .toggle--on {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
    .toggle:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .toggle__thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--color-text-muted);
      transition: transform var(--transition-fast), background var(--transition-fast);
      flex-shrink: 0;
    }
    .toggle--on .toggle__thumb {
      background: #fff;
      transform: translateX(16px);
    }
  `],
})
export class ToggleComponent {
  checked       = input<boolean>(false);
  disabled      = input<boolean>(false);
  checkedChange = output<boolean>();

  toggle(): void {
    if (!this.disabled()) {
      this.checkedChange.emit(!this.checked());
    }
  }
}
