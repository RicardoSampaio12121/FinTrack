import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Transaction, TransactionFilters } from '../models/app.models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly mock = inject(MockDataService);

  getAll(filters?: TransactionFilters): Observable<Transaction[]> {
    let data = [...this.mock.transactions()];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.note?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filters?.type && filters.type !== 'all') {
      data = data.filter(t => t.type === filters.type);
    }
    if (filters?.categoryId) {
      data = data.filter(t => t.categoryId === filters.categoryId);
    }
    if (filters?.month) {
      data = data.filter(t => t.date.startsWith(filters.month!));
    }

    return of(data).pipe(delay(300));
  }

  create(tx: Transaction): Observable<Transaction> {
    this.mock.addTransaction(tx);
    return of(tx).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.mock.deleteTransaction(id);
    return of(undefined).pipe(delay(300));
  }
}
