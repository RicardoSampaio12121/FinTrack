import { Component, computed, input } from '@angular/core';

export interface BarSeries {
  label: string;
  income: number;
  expense: number;
}

@Component({
  selector: 'app-mini-bars',
  standalone: true,
  template: `
    <svg
      width="100%"
      [attr.height]="height()"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="none"
      style="display:block"
    >
      @for (bar of bars(); track $index) {
        <!-- income bar -->
        <rect
          [attr.x]="bar.x"
          [attr.y]="bar.incomeY"
          [attr.width]="barW()"
          [attr.height]="bar.incomeH"
          [attr.fill]="incomeColor()"
          rx="2"
        />
        <!-- expense bar -->
        <rect
          [attr.x]="bar.x + barW() + gap()"
          [attr.y]="bar.expenseY"
          [attr.width]="barW()"
          [attr.height]="bar.expenseH"
          [attr.fill]="expenseColor()"
          rx="2"
        />
      }
    </svg>
  `,
})
export class MiniBarsComponent {
  series       = input<BarSeries[]>([]);
  height       = input<number>(60);
  incomeColor  = input<string>('var(--color-positive)');
  expenseColor = input<string>('var(--color-negative)');

  private readonly W = 200;
  gap  = computed(() => 2);
  barW = computed(() => {
    const n = this.series().length;
    if (n === 0) return 0;
    const totalGap = (n - 1) * 6 + n * this.gap();
    return (this.W - totalGap) / (n * 2);
  });

  viewBox = computed(() => `0 0 ${this.W} ${this.height()}`);

  bars = computed(() => {
    const s = this.series();
    if (s.length === 0) return [];
    const H = this.height();
    const bw = this.barW();
    const g = this.gap();
    const groupW = bw * 2 + g;
    const groupGap = s.length > 1 ? (this.W - s.length * groupW) / (s.length - 1) : 0;
    const maxVal = Math.max(...s.flatMap(p => [p.income, p.expense]), 1);
    const pad = 2;

    return s.map((p, i) => {
      const incomeH = Math.max(2, ((p.income / maxVal) * (H - pad)));
      const expenseH = Math.max(2, ((p.expense / maxVal) * (H - pad)));
      return {
        x: i * (groupW + groupGap),
        incomeY: H - incomeH,
        incomeH,
        expenseY: H - expenseH,
        expenseH,
      };
    });
  });
}
