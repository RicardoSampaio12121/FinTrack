import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Category } from '../models/app.models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly mock = inject(MockDataService);

  getAll(): Observable<Category[]> {
    return of(this.mock.categories()).pipe(delay(300));
  }

  getByType(type: 'income' | 'expense'): Observable<Category[]> {
    return of(this.mock.categories().filter(c => c.type === type && !c.archived)).pipe(delay(300));
  }

  toggleRecurring(id: string): Observable<void> {
    this.mock.toggleCategoryRecurring(id);
    return of(undefined).pipe(delay(150));
  }
}
