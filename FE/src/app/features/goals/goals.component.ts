import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { Goal } from '../../core/models/app.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SegToggleComponent } from '../../shared/ui/seg-toggle/seg-toggle.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar/progress-bar.component';
import { PillComponent } from '../../shared/ui/pill/pill.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    PageHeaderComponent, CardComponent, SegToggleComponent,
    ProgressBarComponent, PillComponent, CurrencyFormatPipe,
  ],
  template: `
    <app-page-header title="Goals" subtitle="Track your savings targets">
    </app-page-header>

    <app-seg-toggle
      [options]="['All', 'With deadline', 'No deadline', 'Done']"
      [value]="filter()"
      (valueChange)="filter.set($event)"
    />

    <div class="goals-grid">
      @for (goal of visibleGoals(); track goal.id) {
        <app-card padding="md" class="goal-card" (click)="openDetail(goal.id)">
          <div class="goal-card__header">
            <span class="goal-card__name">{{ goal.name }}</span>
            @if (goal.deadline) {
              <app-pill [tone]="isOverdue(goal) ? 'negative' : 'outline'">
                {{ formatDeadline(goal.deadline) }}
              </app-pill>
            }
          </div>
          @if (goal.note) {
            <p class="goal-card__note">{{ goal.note }}</p>
          }
          <div class="goal-card__amounts">
            <span class="goal-card__saved">{{ goal.saved | currencyFormat }}</span>
            <span class="goal-card__target">/ {{ goal.target | currencyFormat }}</span>
          </div>
          <app-progress-bar [value]="goal.saved" [max]="goal.target" [height]="6" />
          <div class="goal-card__footer">
            <span class="goal-card__pct">{{ pct(goal) }}% complete</span>
            @if (isDone(goal)) {
              <app-pill tone="positive">✓ Done</app-pill>
            } @else {
              <app-pill tone="neutral">{{ remaining(goal) | currencyFormat }} left</app-pill>
            }
          </div>
        </app-card>
      }

      <!-- New goal placeholder -->
      <div class="goal-card--new" (click)="newGoal()">
        <div class="goal-card__new-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <span>New goal</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: var(--space-5); }

    .goals-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .goal-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      cursor: pointer;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast);
      &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transform: translateY(-1px);
      }
    }
    .goal-card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
    }
    .goal-card__name {
      font-size: var(--text-md);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
    }
    .goal-card__note {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      line-height: var(--leading-normal);
    }
    .goal-card__amounts {
      display: flex;
      align-items: baseline;
      gap: var(--space-1);
    }
    .goal-card__saved {
      font-family: var(--font-mono);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
    }
    .goal-card__target {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .goal-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--space-1);
    }
    .goal-card__pct {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    .goal-card--new {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      border: 2px dashed var(--color-border-dashed);
      border-radius: var(--radius-card);
      padding: var(--space-8);
      cursor: pointer;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
      min-height: 160px;
      &:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
        background: var(--color-positive-bg);
      }
    }
    .goal-card__new-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid currentColor;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class GoalsComponent implements OnInit {
  private readonly goalSvc = inject(GoalService);
  private readonly router  = inject(Router);

  goals  = signal<Goal[]>([]);
  filter = signal('All');

  visibleGoals = computed(() => {
    const f = this.filter();
    switch (f) {
      case 'With deadline': return this.goals().filter(g => g.deadline !== null && !this.isDone(g));
      case 'No deadline':   return this.goals().filter(g => g.deadline === null && !this.isDone(g));
      case 'Done':          return this.goals().filter(g => this.isDone(g));
      default:              return this.goals();
    }
  });

  ngOnInit(): void {
    this.goalSvc.getAll().subscribe(g => this.goals.set(g));
  }

  pct(g: Goal):       number  { return Math.min(100, Math.round((g.saved / g.target) * 100)); }
  isDone(g: Goal):    boolean { return g.saved >= g.target; }
  remaining(g: Goal): number  { return Math.max(0, g.target - g.saved); }

  isOverdue(g: Goal): boolean {
    if (!g.deadline) return false;
    return new Date(g.deadline) < new Date();
  }

  formatDeadline(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  openDetail(id: string): void  { this.router.navigate(['/goals', id]); }
  newGoal(): void {}
}
