import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CashFlowPoint, DashboardTotals } from '../models/app.models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly mock = inject(MockDataService);

  getTotals(): Observable<DashboardTotals> {
    const txns = this.mock.transactions();
    const cats = this.mock.categories();

    const currentMonth = '2026-05';
    const monthlyTxns = txns.filter(t => t.date.startsWith(currentMonth));

    const income  = monthlyTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthlyTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const budgetTotal = cats.filter(c => c.type === 'expense' && !c.archived).reduce((s, c) => s + c.budget, 0);
    const budgetUsed  = cats.filter(c => c.type === 'expense' && !c.archived).reduce((s, c) => s + c.spent, 0);

    return of({ income, expense, net: income - expense, budgetTotal, budgetUsed }).pipe(delay(300));
  }

  getCashFlow(): Observable<CashFlowPoint[]> {
    const data: CashFlowPoint[] = [
      { label: 'Nov', income: 5200, expense: 3400 },
      { label: 'Dec', income: 5800, expense: 4200 },
      { label: 'Jan', income: 5400, expense: 3600 },
      { label: 'Feb', income: 5100, expense: 3200 },
      { label: 'Mar', income: 5900, expense: 4100 },
      { label: 'Apr', income: 5650, expense: 3868 },
      { label: 'May', income: 5970, expense: 3546 },
    ];
    return of(data).pipe(delay(300));
  }
}
