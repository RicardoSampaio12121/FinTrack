import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { TransactionService } from '../../core/services/transaction.service';
import { GoalService } from '../../core/services/goal.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { CashFlowPoint, DashboardTotals, Goal, Transaction, Category } from '../../core/models/app.models';
import { CardComponent } from '../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SectionHeadComponent } from '../../shared/ui/section-head/section-head.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar/progress-bar.component';
import { PillComponent } from '../../shared/ui/pill/pill.component';
import { CatDotComponent } from '../../shared/ui/cat-dot/cat-dot.component';
import { MiniLineComponent, LinePoint } from '../../shared/ui/mini-line/mini-line.component';
import { MiniDonutComponent, DonutSegment } from '../../shared/ui/mini-donut/mini-donut.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SlicePipe,
    CardComponent, PageHeaderComponent, SectionHeadComponent,
    ProgressBarComponent, PillComponent, CatDotComponent,
    MiniLineComponent, MiniDonutComponent, CurrencyFormatPipe,
  ],
  template: `
    <app-page-header [title]="'Good morning, ' + firstName() + ' 👋'" subtitle="Here's your May overview">
    </app-page-header>

    <!-- KPI Row -->
    <div class="kpi-grid">
      @if (totals(); as t) {
        <app-card padding="md" class="kpi-card">
          <div class="kpi-card__label">Income</div>
          <div class="kpi-card__value kpi-card__value--positive">{{ t.income | currencyFormat }}</div>
          <app-pill tone="positive">▲ 5.7%</app-pill>
        </app-card>
        <app-card padding="md" class="kpi-card">
          <div class="kpi-card__label">Expenses</div>
          <div class="kpi-card__value kpi-card__value--negative">{{ t.expense | currencyFormat }}</div>
          <app-pill tone="negative">▼ 2.1%</app-pill>
        </app-card>
        <app-card padding="md" class="kpi-card">
          <div class="kpi-card__label">Net Savings</div>
          <div class="kpi-card__value">{{ t.net | currencyFormat }}</div>
          <app-pill tone="neutral">this month</app-pill>
        </app-card>
        <app-card padding="md" class="kpi-card">
          <div class="kpi-card__label">Budget Used</div>
          <div class="kpi-card__value">{{ t.budgetUsed | currencyFormat }} <span class="kpi-card__of">/ {{ t.budgetTotal | currencyFormat }}</span></div>
          <app-progress-bar [value]="t.budgetUsed" [max]="t.budgetTotal" [height]="5" />
        </app-card>
      } @else {
        <div class="kpi-card kpi-skeleton"></div>
        <div class="kpi-card kpi-skeleton"></div>
        <div class="kpi-card kpi-skeleton"></div>
        <div class="kpi-card kpi-skeleton"></div>
      }
    </div>

    <!-- Main content grid -->
    <div class="dash-grid">

      <!-- Cash Flow Chart -->
      <app-card padding="md" class="dash-card dash-card--cashflow">
        <app-section-head title="Cash Flow — last 7 months" />
        @if (cashFlow().length > 0) {
          <div class="chart-legend">
            <span class="chart-legend__dot chart-legend__dot--income"></span><span>Income</span>
            <span class="chart-legend__dot chart-legend__dot--expense"></span><span>Expenses</span>
          </div>
          <div style="margin-top: var(--space-3)">
            <app-mini-line [points]="incomePoints()" [height]="110" color="var(--color-positive)" [strokeWidth]="2" />
          </div>
          <div class="cashflow-labels">
            @for (p of cashFlow(); track p.label) {
              <span>{{ p.label }}</span>
            }
          </div>
        } @else {
          <div class="skeleton-chart"></div>
        }
      </app-card>

      <!-- Category Donut -->
      <app-card padding="md" class="dash-card dash-card--donut">
        <app-section-head title="Spending by Category" />
        @if (expenseCategories().length > 0) {
          <div class="donut-wrap">
            <app-mini-donut [segments]="donutSegments()" [size]="100" [thickness]="14" />
            <div class="donut-total">
              <div class="donut-total__label">Total</div>
              <div class="donut-total__val">{{ totalExpense() | currencyFormat }}</div>
            </div>
          </div>
          <div class="donut-legend">
            @for (cat of expenseCategories().slice(0, 6); track cat.id) {
              <div class="donut-legend__row">
                <app-cat-dot [color]="cat.color" [size]="8" />
                <span class="donut-legend__name">{{ cat.name }}</span>
                <span class="donut-legend__val">{{ cat.spent | currencyFormat }}</span>
              </div>
            }
          </div>
        }
      </app-card>

      <!-- Recent Transactions -->
      <app-card padding="none" class="dash-card dash-card--txns">
        <div class="dash-card-head">
          <app-section-head title="Recent Transactions" actionLabel="View all" (actionClick)="goToTransactions()" />
        </div>
        <div class="txn-list">
          @for (tx of recentTransactions().slice(0, 6); track tx.id) {
            <div class="txn-row">
              <app-cat-dot [color]="getCatColor(tx.categoryId)" [size]="9" />
              <div class="txn-row__info">
                <span class="txn-row__desc">{{ tx.description }}</span>
                <span class="txn-row__cat">{{ getCatName(tx.categoryId) }}</span>
              </div>
              <div class="txn-row__meta">
                <span class="txn-row__amount" [class.txn-row__amount--inc]="tx.type === 'income'">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currencyFormat }}
                </span>
                <span class="txn-row__date">{{ tx.date | slice: 5 }}</span>
              </div>
            </div>
          }
        </div>
      </app-card>

      <!-- Goals Snapshot -->
      <app-card padding="md" class="dash-card dash-card--goals">
        <app-section-head title="Goals" actionLabel="See all" (actionClick)="goToGoals()" />
        <div class="goals-list">
          @for (g of goals().slice(0, 3); track g.id) {
            <div class="goal-row">
              <div class="goal-row__header">
                <span class="goal-row__name">{{ g.name }}</span>
                <span class="goal-row__pct">{{ goalPct(g) }}%</span>
              </div>
              <app-progress-bar [value]="g.saved" [max]="g.target" [height]="5" />
              <div class="goal-row__footer">
                <span>{{ g.saved | currencyFormat }} saved</span>
                <span>{{ g.target | currencyFormat }}</span>
              </div>
            </div>
          }
        </div>
      </app-card>

    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
    }
    .kpi-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .kpi-skeleton {
      height: 96px;
      background: var(--color-fill);
      border-radius: var(--radius-card);
      animation: pulse 1.4s ease infinite;
    }
    .kpi-card__label {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      font-weight: var(--weight-medium);
    }
    .kpi-card__value {
      font-family: var(--font-mono);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      &--positive { color: var(--color-positive); }
      &--negative { color: var(--color-negative); }
    }
    .kpi-card__of {
      font-size: var(--text-sm);
      font-weight: var(--weight-regular);
      color: var(--color-text-muted);
    }

    .dash-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: var(--space-4);
    }
    .dash-card--cashflow { grid-column: 1 / 2; }
    .dash-card--donut    { grid-column: 2 / 3; }
    .dash-card--txns     { grid-column: 1 / 2; }
    .dash-card--goals    { grid-column: 2 / 3; }

    .chart-legend {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-top: var(--space-1);
    }
    .chart-legend__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      &--income  { background: var(--color-positive); }
      &--expense { background: var(--color-negative); }
    }
    .cashflow-labels {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-1);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .skeleton-chart {
      height: 110px;
      background: var(--color-fill);
      border-radius: 8px;
      animation: pulse 1.4s ease infinite;
    }

    .donut-wrap {
      position: relative;
      display: flex;
      justify-content: center;
      margin: var(--space-3) 0;
    }
    .donut-total {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }
    .donut-total__label {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .donut-total__val {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
    }
    .donut-legend { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3); }
    .donut-legend__row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
    }
    .donut-legend__name { flex: 1; color: var(--color-text-secondary); }
    .donut-legend__val  { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-primary); }

    .dash-card-head { padding: var(--space-5) var(--space-6) 0; }
    .txn-list { display: flex; flex-direction: column; }
    .txn-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-6);
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .txn-row__info { flex: 1; min-width: 0; }
    .txn-row__desc {
      display: block;
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .txn-row__cat {
      display: block;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .txn-row__meta { text-align: right; flex-shrink: 0; }
    .txn-row__amount {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-negative);
      &--inc { color: var(--color-positive); }
    }
    .txn-row__date { font-size: var(--text-xs); color: var(--color-text-muted); }

    .goals-list { display: flex; flex-direction: column; gap: var(--space-5); }
    .goal-row {}
    .goal-row__header {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    .goal-row__name {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
    }
    .goal-row__pct {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-accent);
    }
    .goal-row__footer {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-1);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly firstName = () => this.auth.currentUser()?.displayName?.split(' ').at(0) ?? '';
  private readonly dashboardSvc = inject(DashboardService);
  private readonly txnSvc       = inject(TransactionService);
  private readonly goalSvc      = inject(GoalService);
  private readonly catSvc       = inject(CategoryService);

  totals           = signal<DashboardTotals | null>(null);
  cashFlow         = signal<CashFlowPoint[]>([]);
  recentTransactions = signal<Transaction[]>([]);
  goals            = signal<Goal[]>([]);
  expenseCategories = signal<Category[]>([]);

  incomePoints = signal<LinePoint[]>([]);
  donutSegments = signal<DonutSegment[]>([]);
  totalExpense = signal(0);

  private categoryMap = new Map<string, Category>();

  ngOnInit(): void {
    this.dashboardSvc.getTotals().subscribe(t => this.totals.set(t));
    this.dashboardSvc.getCashFlow().subscribe(cf => {
      this.cashFlow.set(cf);
      this.incomePoints.set(cf.map(p => ({ label: p.label, value: p.income })));
    });
    this.txnSvc.getAll().subscribe(txns => this.recentTransactions.set(txns));
    this.goalSvc.getAll().subscribe(g => this.goals.set(g));
    this.catSvc.getAll().subscribe(cats => {
      cats.forEach(c => this.categoryMap.set(c.id, c));
      const expCats = cats.filter(c => c.type === 'expense' && !c.archived);
      this.expenseCategories.set(expCats);
      this.totalExpense.set(expCats.reduce((s, c) => s + c.spent, 0));
      this.donutSegments.set(expCats.map(c => ({ value: c.spent, color: c.color, label: c.name })));
    });
  }

  getCatColor(catId: string): string { return this.categoryMap.get(catId)?.color ?? '#ccc'; }
  getCatName(catId: string):  string { return this.categoryMap.get(catId)?.name  ?? '—'; }
  goalPct(g: Goal): number { return Math.min(100, Math.round((g.saved / g.target) * 100)); }

  goToTransactions(): void {}
  goToGoals(): void {}
}
