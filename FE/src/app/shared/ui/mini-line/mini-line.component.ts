import { Component, computed, input } from '@angular/core';

export interface LinePoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-mini-line',
  standalone: true,
  template: `
    <svg
      width="100%"
      [attr.height]="height()"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="none"
      style="display:block;overflow:visible"
    >
      <defs>
        <linearGradient [attr.id]="gradId()" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.2" />
          <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
        </linearGradient>
      </defs>
      @if (coords().length >= 2) {
        <path
          [attr.d]="areaPath()"
          [attr.fill]="'url(#' + gradId() + ')'"
          stroke="none"
        />
        <polyline
          [attr.points]="linePath()"
          fill="none"
          [attr.stroke]="color()"
          [attr.stroke-width]="strokeWidth()"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      }
    </svg>
  `,
})
export class MiniLineComponent {
  points      = input<LinePoint[]>([]);
  height      = input<number>(60);
  color       = input<string>('var(--color-accent)');
  strokeWidth = input<number>(2);

  private readonly W = 200;
  private readonly _uid = Math.random().toString(36).slice(2, 7);
  gradId = computed(() => `ml-${this._uid}`);
  viewBox = computed(() => `0 0 ${this.W} ${this.height()}`);

  coords = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return [];
    const H = this.height();
    const vals = pts.map(p => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const pad = 4;
    return pts.map((p, i) => ({
      x: (i / (pts.length - 1)) * this.W,
      y: H - pad - ((p.value - min) / range) * (H - pad * 2),
    }));
  });

  linePath = computed(() =>
    this.coords().map(c => `${c.x},${c.y}`).join(' ')
  );

  areaPath = computed(() => {
    const c = this.coords();
    if (c.length < 2) return '';
    const H = this.height();
    const linePoints = c.map(p => `${p.x},${p.y}`).join(' L');
    return `M${c[0].x},${H} L${linePoints} L${c[c.length - 1].x},${H} Z`;
  });
}
