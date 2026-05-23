import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { Transaction, Category, TransactionFilters } from '../../core/models/app.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SegToggleComponent } from '../../shared/ui/seg-toggle/seg-toggle.component';
import { PillComponent } from '../../shared/ui/pill/pill.component';
import { CatDotComponent } from '../../shared/ui/cat-dot/cat-dot.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ToggleComponent } from '../../shared/ui/toggle/toggle.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe,
    PageHeaderComponent, CardComponent, SegToggleComponent,
    PillComponent, CatDotComponent, ModalComponent, ButtonComponent,
    ToggleComponent, CurrencyFormatPipe,
  ],
  template: `
    <app-page-header title="Transactions" subtitle="All your income & expenses">
      <app-button variant="primary" size="sm" (click)="openAdd()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add transaction
      </app-button>
    </app-page-header>

    <!-- Filters -->
    <app-card padding="sm">
      <div class="filters">
        <div class="filters__search">
          <svg class="filters__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            class="filters__input"
            type="text"
            placeholder="Search transactions…"
            [value]="searchQuery()"
            (input)="onSearch($event)"
          />
        </div>
        <app-seg-toggle
          [options]="['All', 'Income', 'Expense']"
          [value]="typeFilter()"
          (valueChange)="typeFilter.set($event); load()"
        />
        <select class="filters__select" (change)="onCatFilter($event)">
          <option value="">All categories</option>
          @for (c of categories(); track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
        </select>
        <select class="filters__select" (change)="onMonthFilter($event)">
          <option value="">All months</option>
          <option value="2026-05">May 2026</option>
          <option value="2026-04">April 2026</option>
          <option value="2026-03">March 2026</option>
        </select>
      </div>
    </app-card>

    <!-- Table -->
    <app-card padding="none">
      <div class="txn-table">
        <div class="txn-table__head">
          <span>Date</span>
          <span>Description</span>
          <span>Category</span>
          <span>Type</span>
          <span style="text-align:right">Amount</span>
          <span></span>
        </div>
        @if (loading()) {
          @for (_ of [1,2,3,4,5]; track $index) {
            <div class="txn-table__row txn-table__row--skeleton">
              <span class="skel"></span><span class="skel"></span><span class="skel"></span>
              <span class="skel"></span><span class="skel"></span><span></span>
            </div>
          }
        } @else if (transactions().length === 0) {
          <div class="txn-table__empty">No transactions match your filters.</div>
        } @else {
          @for (tx of transactions(); track tx.id) {
            <div class="txn-table__row">
              <span class="txn-date">{{ tx.date | date: 'dd MMM' }}</span>
              <span class="txn-desc">
                {{ tx.description }}
                @if (tx.recurring) { <span class="recurring-badge">↻</span> }
              </span>
              <span class="txn-cat">
                <app-cat-dot [color]="getCatColor(tx.categoryId)" [size]="8" />
                {{ getCatName(tx.categoryId) }}
              </span>
              <span>
                <app-pill [tone]="tx.type === 'income' ? 'positive' : 'negative'">
                  {{ tx.type }}
                </app-pill>
              </span>
              <span class="txn-amount" [class.txn-amount--inc]="tx.type === 'income'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currencyFormat }}
              </span>
              <button class="txn-del" (click)="deleteTransaction(tx.id)" title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          }
        }
      </div>
      @if (!loading() && transactions().length > 0) {
        <div class="txn-footer">
          Showing {{ transactions().length }} transactions
        </div>
      }
    </app-card>

    <!-- Add Transaction Modal -->
    <app-modal [open]="showAdd()" title="Add Transaction" (closed)="closeAdd()">
      <form [formGroup]="addForm" (ngSubmit)="saveTransaction(false)" class="add-form">

        <!-- Type Toggle -->
        <div class="add-form__type-toggle">
          <button
            type="button"
            class="type-btn"
            [class.type-btn--active]="addForm.value.type === 'expense'"
            (click)="addForm.patchValue({ type: 'expense' })"
          >Expense</button>
          <button
            type="button"
            class="type-btn"
            [class.type-btn--active]="addForm.value.type === 'income'"
            (click)="addForm.patchValue({ type: 'income' })"
          >Income</button>
        </div>

        <div class="add-form__row">
          <div class="add-form__field">
            <label class="add-form__label">Amount</label>
            <div class="add-form__money">
              <span class="add-form__currency">€</span>
              <input class="add-form__input add-form__input--amount" type="number" min="0.01" step="0.01" placeholder="0.00" formControlName="amount" />
            </div>
          </div>
          <div class="add-form__field">
            <label class="add-form__label">Date</label>
            <input class="add-form__input" type="date" formControlName="date" />
          </div>
        </div>

        <div class="add-form__field">
          <label class="add-form__label">Description</label>
          <input class="add-form__input" type="text" placeholder="e.g. Groceries at Lidl" formControlName="description" />
        </div>

        <div class="add-form__field">
          <label class="add-form__label">Category</label>
          <select class="add-form__input" formControlName="categoryId">
            <option value="">— Select category —</option>
            @for (c of filteredAddCategories(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>

        <div class="add-form__field">
          <label class="add-form__label">Note <span class="add-form__optional">(optional)</span></label>
          <input class="add-form__input" type="text" placeholder="Additional details…" formControlName="note" />
        </div>

        <div class="add-form__recurring">
          <app-toggle
            [checked]="addForm.value.recurring ?? false"
            (checkedChange)="addForm.patchValue({ recurring: $event })"
          />
          <span class="add-form__recurring-label">Recurring transaction</span>
        </div>

        @if (saveError()) {
          <div class="add-form__error">{{ saveError() }}</div>
        }

        <div class="add-form__footer">
          <app-button variant="ghost" size="sm" (click)="closeAdd()">Cancel</app-button>
          <app-button variant="ghost" size="sm" [loading]="saving()" (click)="saveTransaction(true)">Save & add another</app-button>
          <app-button variant="primary" size="sm" [loading]="saving()" type="submit">Save</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .filters {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
      padding: var(--space-1) var(--space-2);
    }
    .filters__search {
      position: relative;
      flex: 1;
      min-width: 160px;
    }
    .filters__search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      pointer-events: none;
    }
    .filters__input {
      width: 100%;
      padding: 7px 10px 7px 32px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      background: var(--color-bg);
      color: var(--color-text-primary);
      outline: none;
      &:focus { border-color: var(--color-accent); }
      &::placeholder { color: var(--color-text-muted); }
    }
    .filters__select {
      padding: 7px 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      background: var(--color-bg);
      color: var(--color-text-primary);
      cursor: pointer;
      outline: none;
      &:focus { border-color: var(--color-accent); }
    }

    .txn-table { width: 100%; }
    .txn-table__head {
      display: grid;
      grid-template-columns: 90px 1fr 140px 90px 110px 36px;
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .txn-table__row {
      display: grid;
      grid-template-columns: 90px 1fr 140px 90px 110px 36px;
      align-items: center;
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--text-base);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--color-bg); }
    }
    .txn-table__row--skeleton .skel {
      height: 14px;
      background: var(--color-fill);
      border-radius: 4px;
      animation: pulse 1.4s ease infinite;
    }
    .txn-table__empty {
      padding: var(--space-12) var(--space-5);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
    .txn-footer {
      padding: var(--space-3) var(--space-5);
      border-top: 1px solid var(--color-border);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .txn-date { color: var(--color-text-muted); font-size: var(--text-sm); }
    .txn-desc {
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .recurring-badge {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      background: var(--color-fill);
      padding: 1px 5px;
      border-radius: 4px;
    }
    .txn-cat {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
    .txn-amount {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-negative);
      text-align: right;
      &--inc { color: var(--color-positive); }
    }
    .txn-del {
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
      &:hover { background: var(--color-negative-bg); color: var(--color-negative); }
    }

    /* ── Add form ── */
    .add-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .add-form__type-toggle {
      display: flex;
      background: var(--color-fill);
      border-radius: var(--radius-btn);
      padding: 3px;
      gap: 2px;
    }
    .type-btn {
      flex: 1;
      padding: 6px;
      border: none;
      border-radius: 6px;
      font-family: var(--font-body);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      background: transparent;
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
      &--active {
        background: var(--color-surface);
        color: var(--color-text-primary);
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      }
    }
    .add-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .add-form__field { display: flex; flex-direction: column; gap: var(--space-1); }
    .add-form__label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-secondary); }
    .add-form__optional { font-weight: var(--weight-regular); color: var(--color-text-muted); }
    .add-form__money { position: relative; }
    .add-form__currency {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      pointer-events: none;
    }
    .add-form__input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      font-family: var(--font-body);
      font-size: var(--text-base);
      background: var(--color-bg);
      color: var(--color-text-primary);
      outline: none;
      box-sizing: border-box;
      &:focus { border-color: var(--color-accent); }
      &--amount { padding-left: 26px; }
    }
    .add-form__recurring {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .add-form__recurring-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .add-form__error {
      padding: var(--space-3);
      background: var(--color-error-bg);
      color: var(--color-error);
      border-radius: var(--radius-input);
      font-size: var(--text-sm);
    }
    .add-form__footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-2);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `],
})
export class TransactionsComponent implements OnInit {
  private readonly txnSvc  = inject(TransactionService);
  private readonly catSvc  = inject(CategoryService);
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly fb      = inject(FormBuilder);

  transactions = signal<Transaction[]>([]);
  categories   = signal<Category[]>([]);
  loading      = signal(true);
  showAdd      = signal(false);
  saving       = signal(false);
  saveError    = signal('');

  searchQuery = signal('');
  typeFilter  = signal('All');
  catFilter   = signal('');
  monthFilter = signal('');

  private categoryMap = new Map<string, Category>();

  filteredAddCategories = computed(() => {
    const type = this.addForm.value.type as 'income' | 'expense';
    return this.categories().filter(c => c.type === type && !c.archived);
  });

  addForm = this.fb.group({
    type:        ['expense'],
    amount:      [null as number | null, [Validators.required, Validators.min(0.01)]],
    date:        [new Date().toISOString().split('T')[0], Validators.required],
    description: ['', Validators.required],
    categoryId:  ['', Validators.required],
    note:        [''],
    recurring:   [false],
  });

  ngOnInit(): void {
    this.catSvc.getAll().subscribe(cats => {
      this.categories.set(cats.filter(c => !c.archived));
      cats.forEach(c => this.categoryMap.set(c.id, c));
    });
    this.load();
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') this.openAdd();
    });
  }

  load(): void {
    this.loading.set(true);
    const filters: TransactionFilters = {
      search:     this.searchQuery() || undefined,
      type:       (this.typeFilter().toLowerCase() as 'income' | 'expense' | 'all') ?? 'all',
      categoryId: this.catFilter() || undefined,
      month:      this.monthFilter() || undefined,
    };
    this.txnSvc.getAll(filters).subscribe(txns => {
      this.transactions.set(txns);
      this.loading.set(false);
    });
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.load();
  }

  onCatFilter(e: Event): void {
    this.catFilter.set((e.target as HTMLSelectElement).value);
    this.load();
  }

  onMonthFilter(e: Event): void {
    this.monthFilter.set((e.target as HTMLSelectElement).value);
    this.load();
  }

  openAdd(): void {
    this.addForm.reset({
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
    });
    this.saveError.set('');
    this.showAdd.set(true);
  }

  closeAdd(): void {
    this.showAdd.set(false);
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  saveTransaction(andAnother: boolean): void {
    if (this.addForm.invalid) {
      this.saveError.set('Please fill in all required fields.');
      return;
    }
    this.saving.set(true);
    const v = this.addForm.value;
    const tx: Transaction = {
      id:          `tx-${Date.now()}`,
      date:        v.date!,
      description: v.description!,
      categoryId:  v.categoryId!,
      type:        v.type as 'income' | 'expense',
      amount:      v.amount!,
      note:        v.note || undefined,
      recurring:   v.recurring ?? false,
    };
    this.txnSvc.create(tx).subscribe(() => {
      this.saving.set(false);
      this.load();
      if (andAnother) {
        this.addForm.reset({ type: v.type, date: v.date, recurring: false });
        this.saveError.set('');
      } else {
        this.closeAdd();
      }
    });
  }

  deleteTransaction(id: string): void {
    this.txnSvc.delete(id).subscribe(() => this.load());
  }

  getCatColor(catId: string): string { return this.categoryMap.get(catId)?.color ?? '#ccc'; }
  getCatName(catId: string): string  { return this.categoryMap.get(catId)?.name  ?? '—'; }

  get archived(): boolean { return false; }
}
