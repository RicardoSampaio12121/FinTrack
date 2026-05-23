import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo" [class.logo--lg]="size() === 'lg'">
      <div class="logo__avatar">F</div>
      <span class="logo__name">FinTrack</span>
    </div>
  `,
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
}
