import { Component } from '@angular/core';

@Component({
  selector: 'app-divider',
  standalone: true,
  template: `
    <div class="divider">
      <div class="divider__line"></div>
      <span class="divider__label">or</span>
      <div class="divider__line"></div>
    </div>
  `,
  styleUrl: './divider.component.scss',
})
export class DividerComponent {}
