import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cat-dot',
  standalone: true,
  template: ``,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.background]': 'color()',
    '[style.border-radius]': '"50%"',
    '[style.display]': '"inline-block"',
    '[style.flex-shrink]': '"0"',
  },
})
export class CatDotComponent {
  color = input<string>('#ccc');
  size = input<number>(10);
}
