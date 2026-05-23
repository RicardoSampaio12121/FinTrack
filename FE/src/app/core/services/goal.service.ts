import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Goal, GoalContribution } from '../models/app.models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly mock = inject(MockDataService);

  getAll(): Observable<Goal[]> {
    return of(this.mock.goals()).pipe(delay(300));
  }

  getById(id: string): Observable<Goal | undefined> {
    return of(this.mock.goals().find(g => g.id === id)).pipe(delay(300));
  }

  getContributions(goalId: string): Observable<GoalContribution[]> {
    return of(this.mock.contributions().filter(c => c.goalId === goalId)).pipe(delay(300));
  }

  addContribution(goalId: string, amount: number, note?: string): Observable<GoalContribution> {
    const contribution: GoalContribution = {
      id: `c-${Date.now()}`,
      goalId,
      date: new Date().toISOString().split('T')[0],
      amount,
      note,
    };
    this.mock.addGoalContribution(contribution);
    return of(contribution).pipe(delay(300));
  }
}
