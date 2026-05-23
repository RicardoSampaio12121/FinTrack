import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoalService } from '../../../core/services/goal.service';
import { Goal, GoalContribution } from '../../../core/models/app.models';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SectionHeadComponent } from '../../../shared/ui/section-head/section-head.component';
import { ProgressBarComponent } from '../../../shared/ui/progress-bar/progress-bar.component';
import { PillComponent } from '../../../shared/ui/pill/pill.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { MiniLineComponent, LinePoint } from '../../../shared/ui/mini-line/mini-line.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-goal-detail',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    PageHeaderComponent, CardComponent, SectionHeadComponent,
    ProgressBarComponent, PillComponent, ModalComponent, ButtonComponent,
    MiniLineComponent, CurrencyFormatPipe,
  ],
  template: `
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <a routerLink="/goals" class="breadcrumb__link">Goals</a>
      <span class="breadcrumb__sep">›</span>
      <span class="breadcrumb__current">{{ goal()?.name ?? '…' }}</span>
    </nav>

    @if (goal(); as g) {
      <app-page-header [title]="g.name" [subtitle]="g.note">
        <app-button variant="outline" size="sm" (click)="showContrib.set(true)">
          + Add contribution
        </app-button>
      </app-page-header>

      <!-- Hero stats -->
      <div class="hero-grid">
        <app-card padding="md" class="hero-card hero-card--main">
          <div class="hero-card__label">Saved</div>
          <div class="hero-card__val">{{ g.saved | currencyFormat }}</div>
          <app-progress-bar [value]="g.saved" [max]="g.target" [height]="8" />
          <div class="hero-card__sub">{{ pct(g) }}% of {{ g.target | currencyFormat }} target</div>
        </app-card>
        <app-card padding="md" class="hero-card">
          <div class="hero-card__label">Remaining</div>
          <div class="hero-card__val">{{ remaining(g) | currencyFormat }}</div>
        </app-card>
        <app-card padding="md" class="hero-card">
          <div class="hero-card__label">Avg / month</div>
          <div class="hero-card__val">{{ avgMonthly() | currencyFormat }}</div>
        </app-card>
        <app-card padding="md" class="hero-card">
          <div class="hero-card__label">Deadline</div>
          <div class="hero-card__val">
            @if (g.deadline) { {{ formatDate(g.deadline) }} }
            @else { <span style="color:var(--color-text-muted)">No deadline</span> }
          </div>
        </app-card>
      </div>

      <!-- Charts + log / Forecast -->
      <div class="detail-grid">

        <!-- Contribution chart + log -->
        <div class="detail-col">
          <app-card padding="md">
            <app-section-head title="Contribution history" />
            @if (chartPoints().length >= 2) {
              <app-mini-line [points]="chartPoints()" [height]="120" />
            }
          </app-card>

          <app-card padding="none">
            <div class="contrib-head">
              <span>Date</span><span>Amount</span><span>Note</span>
            </div>
            @for (c of contributions(); track c.id) {
              <div class="contrib-row">
                <span class="contrib-date">{{ formatDate(c.date) }}</span>
                <span class="contrib-amount">{{ c.amount | currencyFormat }}</span>
                <span class="contrib-note">{{ c.note ?? '—' }}</span>
              </div>
            }
            @if (contributions().length === 0) {
              <div class="contrib-empty">No contributions yet.</div>
            }
          </app-card>
        </div>

        <!-- Forecast / suggestions -->
        <div class="detail-col">
          <app-card padding="md">
            <app-section-head title="Forecast" />
            @if (g.deadline) {
              <div class="forecast">
                <div class="forecast__row">
                  <span class="forecast__label">Monthly needed</span>
                  <span class="forecast__val">{{ monthlyNeeded(g) | currencyFormat }}</span>
                </div>
                <div class="forecast__row">
                  <span class="forecast__label">Months remaining</span>
                  <span class="forecast__val">{{ monthsRemaining(g) }}</span>
                </div>
                <div class="forecast__row">
                  <span class="forecast__label">On track?</span>
                  <span>
                    @if (isOnTrack(g)) {
                      <app-pill tone="positive">Yes ✓</app-pill>
                    } @else {
                      <app-pill tone="negative">Behind schedule</app-pill>
                    }
                  </span>
                </div>
              </div>
            } @else {
              <p style="color: var(--color-text-muted); font-size: var(--text-sm)">Set a deadline to see forecast.</p>
            }
          </app-card>

          <app-card padding="md">
            <app-section-head title="Suggestions" />
            <ul class="suggestions">
              @if (avgMonthly() > 0 && g.deadline) {
                <li>Increase monthly contributions by <strong>{{ (monthlyNeeded(g) - avgMonthly()) | currencyFormat }}</strong> to stay on track.</li>
              }
              <li>Set up a recurring transfer to automate savings.</li>
              <li>Review expense categories to find room to save more.</li>
            </ul>
          </app-card>
        </div>
      </div>
    } @else {
      <div class="loading">Loading…</div>
    }

    <!-- Add contribution modal -->
    <app-modal [open]="showContrib()" title="Add Contribution" (closed)="showContrib.set(false)">
      <form [formGroup]="contribForm" (ngSubmit)="saveContrib()" class="contrib-form">
        <div class="contrib-form__field">
          <label class="contrib-form__label">Amount</label>
          <div class="contrib-form__money">
            <span class="contrib-form__sym">€</span>
            <input class="contrib-form__input" type="number" min="0.01" step="0.01" placeholder="0.00" formControlName="amount" />
          </div>
        </div>
        <div class="contrib-form__field">
          <label class="contrib-form__label">Note <span class="optional">(optional)</span></label>
          <input class="contrib-form__input" type="text" placeholder="e.g. Monthly transfer" formControlName="note" />
        </div>
        <div class="contrib-form__footer">
          <app-button variant="ghost" size="sm" (click)="showContrib.set(false)">Cancel</app-button>
          <app-button variant="primary" size="sm" type="submit" [loading]="savingContrib()">Save</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .breadcrumb__link {
      color: var(--color-accent);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .breadcrumb__sep { color: var(--color-text-muted); }
    .breadcrumb__current { color: var(--color-text-primary); }

    .hero-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: var(--space-4);
    }
    .hero-card { display: flex; flex-direction: column; gap: var(--space-3); }
    .hero-card--main { }
    .hero-card__label { font-size: var(--text-sm); color: var(--color-text-muted); }
    .hero-card__val {
      font-family: var(--font-mono);
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
    }
    .hero-card__sub { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-1); }

    .detail-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-4);
      align-items: start;
    }
    .detail-col { display: flex; flex-direction: column; gap: var(--space-4); }

    .contrib-head {
      display: grid;
      grid-template-columns: 140px 120px 1fr;
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .contrib-row {
      display: grid;
      grid-template-columns: 140px 120px 1fr;
      align-items: center;
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-base);
      &:last-child { border-bottom: none; }
    }
    .contrib-date   { color: var(--color-text-muted); font-size: var(--text-sm); }
    .contrib-amount { font-family: var(--font-mono); font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-positive); }
    .contrib-note   { color: var(--color-text-muted); font-size: var(--text-sm); }
    .contrib-empty  { padding: var(--space-8); text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); }

    .forecast { display: flex; flex-direction: column; gap: var(--space-4); }
    .forecast__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--text-base);
    }
    .forecast__label { color: var(--color-text-secondary); }
    .forecast__val { font-family: var(--font-mono); font-weight: var(--weight-semibold); color: var(--color-text-primary); }

    .suggestions {
      margin: 0;
      padding-left: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      line-height: var(--leading-normal);
    }
    .loading { padding: var(--space-12); text-align: center; color: var(--color-text-muted); }

    .contrib-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .contrib-form__field { display: flex; flex-direction: column; gap: var(--space-1); }
    .contrib-form__label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-secondary); }
    .optional { font-weight: var(--weight-regular); color: var(--color-text-muted); }
    .contrib-form__money { position: relative; }
    .contrib-form__sym {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      pointer-events: none;
    }
    .contrib-form__input {
      width: 100%;
      padding: 8px 10px 8px 26px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      font-family: var(--font-body);
      font-size: var(--text-base);
      background: var(--color-bg);
      color: var(--color-text-primary);
      outline: none;
      box-sizing: border-box;
      &:focus { border-color: var(--color-accent); }
    }
    .contrib-form__footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class GoalDetailComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly goalSvc = inject(GoalService);
  private readonly fb      = inject(FormBuilder);

  goal          = signal<Goal | null>(null);
  contributions = signal<GoalContribution[]>([]);
  showContrib   = signal(false);
  savingContrib = signal(false);

  chartPoints = computed((): LinePoint[] => {
    const sorted = [...this.contributions()].sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return sorted.map(c => {
      running += c.amount;
      return { label: c.date.slice(5), value: running };
    });
  });

  avgMonthly = computed(() => {
    const cs = this.contributions();
    if (cs.length === 0) return 0;
    const total = cs.reduce((s, c) => s + c.amount, 0);
    return total / cs.length;
  });

  contribForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    note:   [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.goalSvc.getById(id).subscribe(g => {
      if (!g) { this.router.navigate(['/goals']); return; }
      this.goal.set(g);
    });
    this.goalSvc.getContributions(id).subscribe(cs => this.contributions.set(cs));
  }

  pct(g: Goal):       number { return Math.min(100, Math.round((g.saved / g.target) * 100)); }
  remaining(g: Goal): number { return Math.max(0, g.target - g.saved); }

  monthsRemaining(g: Goal): number {
    if (!g.deadline) return 0;
    const now = new Date();
    const end = new Date(g.deadline);
    return Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }

  monthlyNeeded(g: Goal): number {
    const m = this.monthsRemaining(g);
    if (m <= 0) return this.remaining(g);
    return this.remaining(g) / m;
  }

  isOnTrack(g: Goal): boolean {
    return this.avgMonthly() >= this.monthlyNeeded(g);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  saveContrib(): void {
    if (this.contribForm.invalid) return;
    const goalId = this.route.snapshot.paramMap.get('id') ?? '';
    this.savingContrib.set(true);
    const { amount, note } = this.contribForm.value;
    this.goalSvc.addContribution(goalId, amount!, note ?? undefined).subscribe(c => {
      this.savingContrib.set(false);
      this.contributions.update(cs => [c, ...cs]);
      this.goalSvc.getById(goalId).subscribe(g => { if (g) this.goal.set(g); });
      this.showContrib.set(false);
      this.contribForm.reset();
    });
  }
}
