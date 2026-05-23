import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/app.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SegToggleComponent } from '../../shared/ui/seg-toggle/seg-toggle.component';
import { SectionHeadComponent } from '../../shared/ui/section-head/section-head.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar/progress-bar.component';
import { PillComponent } from '../../shared/ui/pill/pill.component';
import { CatDotComponent } from '../../shared/ui/cat-dot/cat-dot.component';
import { ToggleComponent } from '../../shared/ui/toggle/toggle.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    PageHeaderComponent, CardComponent, SegToggleComponent,
    ProgressBarComponent, PillComponent,
    CatDotComponent, ToggleComponent, CurrencyFormatPipe,
  ],
  template: `
    <app-page-header title="Categories" subtitle="Manage your spending & income categories">
    </app-page-header>

    <!-- Summary stats -->
    <div class="cat-stats">
      <app-card padding="md" class="cat-stat-card">
        <div class="cat-stat__label">Expense categories</div>
        <div class="cat-stat__val">{{ expenseCount() }}</div>
      </app-card>
      <app-card padding="md" class="cat-stat-card">
        <div class="cat-stat__label">Income categories</div>
        <div class="cat-stat__val">{{ incomeCount() }}</div>
      </app-card>
      <app-card padding="md" class="cat-stat-card">
        <div class="cat-stat__label">Over-budget</div>
        <div class="cat-stat__val cat-stat__val--negative">{{ overBudgetCount() }}</div>
      </app-card>
      <app-card padding="md" class="cat-stat-card">
        <div class="cat-stat__label">Recurring</div>
        <div class="cat-stat__val">{{ recurringCount() }}</div>
      </app-card>
    </div>

    <!-- Tab filter -->
    <div class="cat-tabs">
      <app-seg-toggle
        [options]="['Expense', 'Income', 'Archived']"
        [value]="tab()"
        (valueChange)="tab.set($event)"
      />
    </div>

    <!-- Category list -->
    <app-card padding="none">
      <div class="cat-list-head">
        <span>Category</span>
        <span>Budget</span>
        <span>Spent</span>
        <span>Usage</span>
        <span>Status</span>
        <span>Recurring</span>
        <span></span>
      </div>
      @if (visibleCategories().length === 0) {
        <div class="cat-empty">No categories in this tab.</div>
      }
      @for (cat of visibleCategories(); track cat.id) {
        <div class="cat-row">
          <div class="cat-row__name">
            <app-cat-dot [color]="cat.color" [size]="10" />
            <span>{{ cat.name }}</span>
          </div>
          <span class="cat-row__mono">
            @if (cat.budget > 0) { {{ cat.budget | currencyFormat }} }
            @else { — }
          </span>
          <span class="cat-row__mono">{{ cat.spent | currencyFormat }}</span>
          <div class="cat-row__bar">
            @if (cat.budget > 0) {
              <app-progress-bar [value]="cat.spent" [max]="cat.budget" [height]="5" [color]="cat.color" />
              <span class="cat-row__pct">{{ pct(cat) }}%</span>
            } @else {
              <span style="color: var(--color-text-muted); font-size: var(--text-xs)">No budget</span>
            }
          </div>
          <span>
            @if (cat.budget > 0 && cat.spent > cat.budget) {
              <app-pill tone="negative">Over budget</app-pill>
            } @else if (cat.budget > 0) {
              <app-pill tone="positive">On track</app-pill>
            } @else {
              <app-pill tone="neutral">Tracking</app-pill>
            }
          </span>
          <div class="cat-row__toggle">
            <app-toggle
              [checked]="cat.recurring"
              (checkedChange)="toggleRecurring(cat.id)"
            />
          </div>
          <div class="cat-row__actions">
            <button class="cat-action-btn" title="Edit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>
      }
    </app-card>
  `,
  styles: [`
    .cat-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
    }
    .cat-stat-card { display: flex; flex-direction: column; gap: var(--space-1); }
    .cat-stat__label { font-size: var(--text-sm); color: var(--color-text-muted); }
    .cat-stat__val {
      font-family: var(--font-mono);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      &--negative { color: var(--color-negative); }
    }
    .cat-tabs { display: flex; }

    .cat-list-head {
      display: grid;
      grid-template-columns: 1fr 100px 100px 180px 110px 90px 60px;
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .cat-row {
      display: grid;
      grid-template-columns: 1fr 100px 100px 180px 110px 90px 60px;
      align-items: center;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--color-bg); }
    }
    .cat-row__name {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
    }
    .cat-row__mono {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
    .cat-row__bar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding-right: var(--space-3);
    }
    .cat-row__pct {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cat-row__toggle { display: flex; }
    .cat-row__actions { display: flex; gap: var(--space-1); }
    .cat-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      &:hover { background: var(--color-fill); color: var(--color-text-primary); }
    }
    .cat-empty {
      padding: var(--space-12);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `],
})
export class CategoriesComponent implements OnInit {
  private readonly catSvc = inject(CategoryService);

  allCategories = signal<Category[]>([]);
  tab = signal('Expense');

  visibleCategories = computed(() => {
    const t = this.tab();
    if (t === 'Archived') return this.allCategories().filter(c => c.archived);
    if (t === 'Income')   return this.allCategories().filter(c => c.type === 'income' && !c.archived);
    return this.allCategories().filter(c => c.type === 'expense' && !c.archived);
  });

  expenseCount  = computed(() => this.allCategories().filter(c => c.type === 'expense' && !c.archived).length);
  incomeCount   = computed(() => this.allCategories().filter(c => c.type === 'income'  && !c.archived).length);
  overBudgetCount = computed(() => this.allCategories().filter(c => c.spent > c.budget && c.budget > 0 && !c.archived).length);
  recurringCount  = computed(() => this.allCategories().filter(c => c.recurring && !c.archived).length);

  ngOnInit(): void {
    this.catSvc.getAll().subscribe(cats => this.allCategories.set(cats));
  }

  toggleRecurring(id: string): void {
    this.catSvc.toggleRecurring(id).subscribe(() =>
      this.catSvc.getAll().subscribe(cats => this.allCategories.set(cats))
    );
  }

  pct(cat: Category): number {
    if (cat.budget <= 0) return 0;
    return Math.min(100, Math.round((cat.spent / cat.budget) * 100));
  }
}
