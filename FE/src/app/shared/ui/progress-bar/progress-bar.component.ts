import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="progress-bar" [style.height.px]="height()">
      <div
        class="progress-bar__fill"
        [class.progress-bar__fill--over]="isOver()"
        [style.width]="clampedPercent() + '%'"
        [style.background]="isOver() ? null : color()"
      ></div>
    </div>
  `,
  styles: [`
    .progress-bar {
      width: 100%;
      background: var(--color-fill);
      border-radius: 100px;
      overflow: hidden;
    }
    .progress-bar__fill {
      height: 100%;
      border-radius: 100px;
      transition: width 0.4s ease;
      background: var(--color-accent);
    }
    .progress-bar__fill--over {
      background: repeating-linear-gradient(
        -45deg,
        var(--color-negative),
        var(--color-negative) 4px,
        var(--color-negative-bg) 4px,
        var(--color-negative-bg) 8px
      );
      width: 100% !important;
    }
  `],
})
export class ProgressBarComponent {
  value = input<number>(0);
  max   = input<number>(100);
  height = input<number>(6);
  color  = input<string>('var(--color-accent)');

  percent = computed(() => this.max() > 0 ? (this.value() / this.max()) * 100 : 0);
  isOver  = computed(() => this.value() > this.max());
  clampedPercent = computed(() => Math.min(this.percent(), 100));
}
