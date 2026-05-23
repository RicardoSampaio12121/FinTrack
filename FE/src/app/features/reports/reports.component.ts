import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DashboardService } from '../../core/services/dashboard.service';
import { CategoryService } from '../../core/services/category.service';
import { GoalService } from '../../core/services/goal.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Category, Goal, CashFlowPoint } from '../../core/models/app.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeadComponent } from '../../shared/ui/section-head/section-head.component';
import { SegToggleComponent } from '../../shared/ui/seg-toggle/seg-toggle.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar/progress-bar.component';
import { PillComponent } from '../../shared/ui/pill/pill.component';
import { CatDotComponent } from '../../shared/ui/cat-dot/cat-dot.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { MiniDonutComponent, DonutSegment } from '../../shared/ui/mini-donut/mini-donut.component';
import { MiniLineComponent, LinePoint } from '../../shared/ui/mini-line/mini-line.component';
import { MiniBarsComponent, BarSeries } from '../../shared/ui/mini-bars/mini-bars.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent, CardComponent, SectionHeadComponent,
    ProgressBarComponent, CatDotComponent,
    ModalComponent, ButtonComponent,
    MiniDonutComponent, MiniLineComponent, MiniBarsComponent,
    CurrencyFormatPipe,
  ],
  template: `
    <app-page-header title="Reports" subtitle="Insights into your financial health">
      <select class="period-select">
        <option>May 2026</option>
        <option>April 2026</option>
        <option>Q1 2026</option>
        <option>2025</option>
      </select>
      <app-button variant="outline" size="sm" (click)="showExport.set(true)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </app-button>
    </app-page-header>

    <div class="reports-grid">

      <!-- Spending by Category (donut) -->
      <app-card padding="md" class="reports-card reports-card--donut">
        <app-section-head title="Spending by Category" />
        <div class="donut-layout">
          <div class="donut-chart-wrap">
            <app-mini-donut [segments]="donutSegments()" [size]="140" [thickness]="20" />
            <div class="donut-center">
              <div class="donut-center__label">Total</div>
              <div class="donut-center__val">{{ totalSpent() | currencyFormat }}</div>
            </div>
          </div>
          <div class="donut-legend">
            @for (cat of expenseCats(); track cat.id) {
              <div class="donut-leg-row">
                <app-cat-dot [color]="cat.color" [size]="9" />
                <span class="donut-leg-name">{{ cat.name }}</span>
                <span class="donut-leg-pct">{{ catPct(cat) }}%</span>
                <span class="donut-leg-val">{{ cat.spent | currencyFormat }}</span>
              </div>
            }
          </div>
        </div>
      </app-card>

      <!-- Income vs Expense (bars) -->
      <app-card padding="md" class="reports-card reports-card--bars">
        <app-section-head title="Income vs Expenses" />
        <div class="chart-legend">
          <span class="legend-dot legend-dot--inc"></span> Income
          <span class="legend-dot legend-dot--exp"></span> Expenses
        </div>
        <div style="margin-top: var(--space-4)">
          <app-mini-bars [series]="barSeries()" [height]="130" />
        </div>
        <div class="bar-labels">
          @for (p of cashFlow(); track p.label) { <span>{{ p.label }}</span> }
        </div>
      </app-card>

      <!-- Net Balance (line) -->
      <app-card padding="md" class="reports-card reports-card--line">
        <app-section-head title="Net Balance Trend" />
        <app-mini-line [points]="netPoints()" [height]="120" color="var(--color-accent)" [strokeWidth]="2.5" />
        <div class="line-labels">
          @for (p of cashFlow(); track p.label) { <span>{{ p.label }}</span> }
        </div>
      </app-card>

      <!-- Top Expenses -->
      <app-card padding="md" class="reports-card reports-card--top">
        <app-section-head title="Top Expenses" />
        <div class="top-list">
          @for (cat of topExpenses(); track cat.id) {
            <div class="top-row">
              <div class="top-row__header">
                <div class="top-row__name">
                  <app-cat-dot [color]="cat.color" [size]="9" />
                  {{ cat.name }}
                </div>
                <div class="top-row__amounts">
                  <span class="top-row__spent">{{ cat.spent | currencyFormat }}</span>
                  @if (cat.budget > 0) {
                    <span class="top-row__budget">/ {{ cat.budget | currencyFormat }}</span>
                  }
                </div>
              </div>
              @if (cat.budget > 0) {
                <app-progress-bar [value]="cat.spent" [max]="cat.budget" [height]="5" [color]="cat.color" />
              }
            </div>
          }
        </div>
      </app-card>

      <!-- Goal Progress -->
      <app-card padding="md" class="reports-card reports-card--goals">
        <app-section-head title="Goal Progress" />
        <div class="goal-progress-list">
          @for (g of goals(); track g.id) {
            <div class="gp-row">
              <div class="gp-row__header">
                <span class="gp-row__name">{{ g.name }}</span>
                <span class="gp-row__pct">{{ goalPct(g) }}%</span>
              </div>
              <app-progress-bar [value]="g.saved" [max]="g.target" [height]="6" />
              <div class="gp-row__footer">
                <span>{{ g.saved | currencyFormat }}</span>
                <span>{{ g.target | currencyFormat }}</span>
              </div>
            </div>
          }
        </div>
      </app-card>

    </div>

    <!-- Export Modal -->
    <app-modal [open]="showExport()" title="Export Report" (closed)="showExport.set(false)">
      <div class="export-form">

        <!-- Format -->
        <div class="export-section">
          <div class="export-section__label">Format</div>
          <div class="format-cards">
            <div class="format-card" [class.format-card--active]="exportFormat() === 'csv'" (click)="exportFormat.set('csv')">
              <div class="format-card__icon">📊</div>
              <div class="format-card__name">CSV</div>
              <div class="format-card__desc">Spreadsheet-compatible</div>
            </div>
            <div class="format-card" [class.format-card--active]="exportFormat() === 'pdf'" (click)="exportFormat.set('pdf')">
              <div class="format-card__icon">📄</div>
              <div class="format-card__name">PDF</div>
              <div class="format-card__desc">Print-ready report</div>
            </div>
          </div>
        </div>

        <!-- Include -->
        <div class="export-section">
          <div class="export-section__label">Include</div>
          <div class="include-checks">
            @for (opt of includeOptions; track opt.key) {
              <label class="check-row">
                <input type="checkbox" [checked]="includeMap[opt.key]" (change)="toggleInclude(opt.key)" />
                {{ opt.label }}
              </label>
            }
          </div>
        </div>

        <!-- Date range -->
        <div class="export-section">
          <div class="export-section__label">Date range</div>
          <div class="date-range">
            <input type="date" class="date-input" value="2026-05-01" />
            <span>to</span>
            <input type="date" class="date-input" value="2026-05-31" />
          </div>
        </div>

        <div class="export-footer">
          <app-button variant="ghost" size="sm" (click)="showExport.set(false)">Cancel</app-button>
          <app-button variant="primary" size="sm" (click)="downloadExport()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download {{ exportFormat().toUpperCase() }}
          </app-button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    .period-select {
      padding: 7px 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      background: var(--color-bg);
      color: var(--color-text-primary);
      cursor: pointer;
      outline: none;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    .reports-card--line  { grid-column: 1 / 2; }
    .reports-card--top   { grid-column: 2 / 3; }
    .reports-card--goals { grid-column: 1 / -1; }

    /* Donut */
    .donut-layout { display: flex; gap: var(--space-6); align-items: center; }
    .donut-chart-wrap { position: relative; flex-shrink: 0; }
    .donut-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }
    .donut-center__label { font-size: var(--text-xs); color: var(--color-text-muted); }
    .donut-center__val { font-family: var(--font-mono); font-size: var(--text-sm); font-weight: var(--weight-bold); color: var(--color-text-primary); }
    .donut-legend { flex: 1; display: flex; flex-direction: column; gap: var(--space-2); }
    .donut-leg-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
    }
    .donut-leg-name { flex: 1; color: var(--color-text-secondary); }
    .donut-leg-pct  { color: var(--color-text-muted); font-size: var(--text-xs); }
    .donut-leg-val  { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-primary); }

    /* Bars */
    .chart-legend {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .legend-dot {
      width: 8px; height: 8px; border-radius: 50%;
      display: inline-block; margin-right: 2px;
      &--inc { background: var(--color-positive); }
      &--exp { background: var(--color-negative); }
    }
    .bar-labels, .line-labels {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-2);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    /* Top expenses */
    .top-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .top-row {}
    .top-row__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    .top-row__name {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
    }
    .top-row__amounts { display: flex; align-items: baseline; gap: var(--space-1); }
    .top-row__spent { font-family: var(--font-mono); font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-text-primary); }
    .top-row__budget { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-muted); }

    /* Goal progress */
    .goal-progress-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
    }
    .gp-row {}
    .gp-row__header { display: flex; justify-content: space-between; margin-bottom: var(--space-2); }
    .gp-row__name { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-primary); }
    .gp-row__pct  { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-accent); }
    .gp-row__footer { display: flex; justify-content: space-between; margin-top: var(--space-1); font-size: var(--text-xs); color: var(--color-text-muted); }

    /* Export modal */
    .export-form { display: flex; flex-direction: column; gap: var(--space-5); }
    .export-section {}
    .export-section__label { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-text-primary); margin-bottom: var(--space-3); }
    .format-cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .format-card {
      border: 2px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--space-4);
      cursor: pointer;
      text-align: center;
      transition: border-color var(--transition-fast), background var(--transition-fast);
      &--active { border-color: var(--color-accent); background: var(--color-positive-bg); }
      &:hover:not(&--active) { border-color: var(--color-border-dashed); }
    }
    .format-card__icon { font-size: 24px; margin-bottom: var(--space-1); }
    .format-card__name { font-weight: var(--weight-semibold); font-size: var(--text-base); }
    .format-card__desc { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }
    .include-checks { display: flex; flex-direction: column; gap: var(--space-2); }
    .check-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      cursor: pointer;
      input { accent-color: var(--color-accent); width: 14px; height: 14px; cursor: pointer; }
    }
    .date-range {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .date-input {
      padding: 7px 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      background: var(--color-bg);
      color: var(--color-text-primary);
      outline: none;
      &:focus { border-color: var(--color-accent); }
    }
    .export-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class ReportsComponent implements OnInit {
  private readonly dashSvc = inject(DashboardService);
  private readonly catSvc  = inject(CategoryService);
  private readonly goalSvc = inject(GoalService);

  cashFlow    = signal<CashFlowPoint[]>([]);
  expenseCats = signal<Category[]>([]);
  goals       = signal<Goal[]>([]);
  showExport  = signal(false);
  exportFormat = signal<'csv' | 'pdf'>('csv');

  includeOptions = [
    { key: 'transactions', label: 'Transactions' },
    { key: 'categories',   label: 'Category breakdown' },
    { key: 'goals',        label: 'Goal progress' },
    { key: 'charts',       label: 'Charts (PDF only)' },
  ];
  includeMap: Record<string, boolean> = {
    transactions: true, categories: true, goals: true, charts: true,
  };

  donutSegments = computed((): DonutSegment[] =>
    this.expenseCats().map(c => ({ value: c.spent, color: c.color, label: c.name }))
  );
  totalSpent = computed(() => this.expenseCats().reduce((s, c) => s + c.spent, 0));
  topExpenses = computed(() =>
    [...this.expenseCats()].sort((a, b) => b.spent - a.spent).slice(0, 5)
  );

  barSeries = computed((): BarSeries[] =>
    this.cashFlow().map(p => ({ label: p.label, income: p.income, expense: p.expense }))
  );

  netPoints = computed((): LinePoint[] =>
    this.cashFlow().map(p => ({ label: p.label, value: p.income - p.expense }))
  );

  ngOnInit(): void {
    this.dashSvc.getCashFlow().subscribe(cf => this.cashFlow.set(cf));
    this.catSvc.getByType('expense').subscribe(cats => this.expenseCats.set(cats));
    this.goalSvc.getAll().subscribe(g => this.goals.set(g));
  }

  catPct(cat: Category): number {
    const total = this.totalSpent();
    if (total === 0) return 0;
    return Math.round((cat.spent / total) * 100);
  }

  goalPct(g: Goal): number { return Math.min(100, Math.round((g.saved / g.target) * 100)); }

  toggleInclude(key: string): void {
    this.includeMap[key] = !this.includeMap[key];
  }

  downloadExport(): void {
    // Placeholder — swap for real HTTP download when API is ready
    alert(`Downloading ${this.exportFormat().toUpperCase()} report…`);
    this.showExport.set(false);
  }
}
