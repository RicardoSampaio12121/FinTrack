import { Component, effect, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal-panel" role="dialog" [attr.aria-label]="title()">
          @if (title()) {
            <div class="modal-panel__header">
              <h2 class="modal-panel__title">{{ title() }}</h2>
              <button class="modal-panel__close" (click)="closeModal()" type="button" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          }
          <div class="modal-panel__body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: var(--z-overlay);
      background: var(--overlay-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      animation: fade-in 0.15s ease;
    }
    .modal-panel {
      background: var(--color-surface);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-modal);
      width: 100%;
      max-width: 520px;
      max-height: 90dvh;
      overflow-y: auto;
      z-index: var(--z-modal);
      animation: slide-up 0.15s ease;
    }
    .modal-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      background: var(--color-surface);
      z-index: 1;
    }
    .modal-panel__title {
      font-family: var(--font-body);
      font-size: var(--text-md);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
    .modal-panel__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      &:hover { background: var(--color-fill); color: var(--color-text-primary); }
    }
    .modal-panel__body {
      padding: var(--space-6);
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ModalComponent {
  open   = input<boolean>(false);
  title  = input<string>('');
  closed = output<void>();

  constructor() {
    effect(() => {
      if (this.open()) {
        document.addEventListener('keydown', this.handleKey);
      } else {
        document.removeEventListener('keydown', this.handleKey);
      }
    });
  }

  private readonly handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeModal();
  };

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.closed.emit();
  }
}
