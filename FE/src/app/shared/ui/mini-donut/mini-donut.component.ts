import { Component, computed, input } from '@angular/core';

export interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

@Component({
  selector: 'app-mini-donut',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
      style="display:block;overflow:visible"
    >
      @for (seg of arcSegments(); track $index) {
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke]="seg.color"
          [attr.stroke-width]="strokeW()"
          [attr.stroke-dasharray]="seg.dashArray"
          [attr.stroke-dashoffset]="seg.dashOffset"
          stroke-linecap="butt"
          transform-origin="center"
          style="transform: rotate(-90deg)"
        />
      }
      @if (arcSegments().length === 0) {
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          stroke="var(--color-fill)"
          [attr.stroke-width]="strokeW()"
        />
      }
    </svg>
  `,
})
export class MiniDonutComponent {
  segments = input<DonutSegment[]>([]);
  size     = input<number>(80);
  thickness = input<number>(10);

  radius   = computed(() => (this.size() - this.strokeW()) / 2);
  strokeW  = computed(() => this.thickness());
  circumference = computed(() => 2 * Math.PI * this.radius());

  arcSegments = computed(() => {
    const total = this.segments().reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return [];

    const circ = this.circumference();
    let offset = 0;
    return this.segments().map(seg => {
      const dash = (seg.value / total) * circ;
      const dashArray = `${dash} ${circ - dash}`;
      const dashOffset = -offset;
      offset += dash;
      return { ...seg, dashArray, dashOffset };
    });
  });
}
