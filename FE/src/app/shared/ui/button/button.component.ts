import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: { '[class]': '"btn-host"' },
})
export class ButtonComponent {
  variant = input<'primary' | 'ghost'>('primary');
  loading = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
}
