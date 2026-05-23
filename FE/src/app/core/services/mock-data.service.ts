import { Injectable, signal } from '@angular/core';
import { Category, Goal, GoalContribution, Transaction } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // ─── Categories ────────────────────────────────────────────────────────────

  private readonly _categories = signal<Category[]>([
    { id: 'cat-1',  name: 'Housing',       type: 'expense', recurring: true,  budget: 1500, spent: 1380, color: '#6c7a89' },
    { id: 'cat-2',  name: 'Food & Dining', type: 'expense', recurring: false, budget: 600,  spent: 720,  color: '#e67e22' },
    { id: 'cat-3',  name: 'Transport',     type: 'expense', recurring: false, budget: 300,  spent: 180,  color: '#3498db' },
    { id: 'cat-4',  name: 'Entertainment', type: 'expense', recurring: false, budget: 200,  spent: 240,  color: '#9b59b6' },
    { id: 'cat-5',  name: 'Healthcare',    type: 'expense', recurring: false, budget: 150,  spent: 85,   color: '#e74c3c' },
    { id: 'cat-6',  name: 'Personal',      type: 'expense', recurring: false, budget: 100,  spent: 65,   color: '#1abc9c' },
    { id: 'cat-7',  name: 'Shopping',      type: 'expense', recurring: false, budget: 250,  spent: 198,  color: '#f39c12' },
    { id: 'cat-8',  name: 'Subscriptions', type: 'expense', recurring: true,  budget: 80,   spent: 78,   color: '#34495e' },
    { id: 'cat-9',  name: 'Salary',        type: 'income',  recurring: true,  budget: 5000, spent: 5000, color: '#2ecc71' },
    { id: 'cat-10', name: 'Freelance',     type: 'income',  recurring: false, budget: 1000, spent: 650,  color: '#27ae60' },
    { id: 'cat-11', name: 'Investments',   type: 'income',  recurring: false, budget: 500,  spent: 320,  color: '#16a085' },
    { id: 'cat-ar', name: 'Old Savings',   type: 'expense', recurring: false, budget: 200,  spent: 0,    color: '#95a5a6', archived: true },
  ]);

  readonly categories = this._categories.asReadonly();

  // ─── Transactions ──────────────────────────────────────────────────────────

  private readonly _transactions = signal<Transaction[]>([
    { id: 'tx-1',  date: '2026-05-22', description: 'Monthly Rent',       categoryId: 'cat-1',  type: 'expense', amount: 1200, recurring: true },
    { id: 'tx-2',  date: '2026-05-22', description: 'Groceries',          categoryId: 'cat-2',  type: 'expense', amount: 85.40 },
    { id: 'tx-3',  date: '2026-05-21', description: 'Spotify',            categoryId: 'cat-8',  type: 'expense', amount: 9.99, recurring: true },
    { id: 'tx-4',  date: '2026-05-20', description: 'Freelance Project',  categoryId: 'cat-10', type: 'income',  amount: 650,  note: 'Web design' },
    { id: 'tx-5',  date: '2026-05-19', description: 'Restaurant dinner',  categoryId: 'cat-2',  type: 'expense', amount: 47.60 },
    { id: 'tx-6',  date: '2026-05-18', description: 'Netflix',            categoryId: 'cat-8',  type: 'expense', amount: 15.99, recurring: true },
    { id: 'tx-7',  date: '2026-05-17', description: 'Pharmacy',           categoryId: 'cat-5',  type: 'expense', amount: 28.50 },
    { id: 'tx-8',  date: '2026-05-16', description: 'Salary',             categoryId: 'cat-9',  type: 'income',  amount: 5000, recurring: true },
    { id: 'tx-9',  date: '2026-05-15', description: 'Uber',               categoryId: 'cat-3',  type: 'expense', amount: 12.80 },
    { id: 'tx-10', date: '2026-05-14', description: 'Clothes',            categoryId: 'cat-7',  type: 'expense', amount: 89.90 },
    { id: 'tx-11', date: '2026-05-13', description: 'Electricity Bill',   categoryId: 'cat-1',  type: 'expense', amount: 95, recurring: true },
    { id: 'tx-12', date: '2026-05-12', description: 'Investment Return',  categoryId: 'cat-11', type: 'income',  amount: 320 },
    { id: 'tx-13', date: '2026-05-11', description: 'Coffee & Bakery',    categoryId: 'cat-2',  type: 'expense', amount: 18.30 },
    { id: 'tx-14', date: '2026-05-10', description: 'Concert tickets',    categoryId: 'cat-4',  type: 'expense', amount: 95, note: 'Rock band' },
    { id: 'tx-15', date: '2026-05-09', description: 'Haircut',            categoryId: 'cat-6',  type: 'expense', amount: 25 },
    { id: 'tx-16', date: '2026-05-08', description: 'Gym subscription',   categoryId: 'cat-8',  type: 'expense', amount: 49.99, recurring: true },
    { id: 'tx-17', date: '2026-05-07', description: 'Groceries',          categoryId: 'cat-2',  type: 'expense', amount: 73.20 },
    { id: 'tx-18', date: '2026-05-06', description: 'Bus pass',           categoryId: 'cat-3',  type: 'expense', amount: 35 },
    { id: 'tx-19', date: '2026-05-05', description: 'Online course',      categoryId: 'cat-4',  type: 'expense', amount: 49, note: 'Angular advanced' },
    { id: 'tx-20', date: '2026-05-04', description: 'Water & Internet',   categoryId: 'cat-1',  type: 'expense', amount: 85, recurring: true },
    { id: 'tx-21', date: '2026-05-03', description: 'Takeout',            categoryId: 'cat-2',  type: 'expense', amount: 32.50 },
    { id: 'tx-22', date: '2026-05-02', description: 'Books',              categoryId: 'cat-7',  type: 'expense', amount: 38 },
    { id: 'tx-23', date: '2026-05-01', description: 'Supplements',        categoryId: 'cat-5',  type: 'expense', amount: 56.50 },
    { id: 'tx-24', date: '2026-04-30', description: 'Shopping trip',      categoryId: 'cat-7',  type: 'expense', amount: 70.10 },
    { id: 'tx-25', date: '2026-04-28', description: 'Cinema',             categoryId: 'cat-4',  type: 'expense', amount: 24, note: 'IMAX' },
    { id: 'tx-26', date: '2026-04-26', description: 'Taxi',               categoryId: 'cat-3',  type: 'expense', amount: 18.90 },
    { id: 'tx-27', date: '2026-04-25', description: 'Birthday gift',      categoryId: 'cat-6',  type: 'expense', amount: 40 },
    { id: 'tx-28', date: '2026-04-24', description: 'Supermarket',        categoryId: 'cat-2',  type: 'expense', amount: 91.80 },
    { id: 'tx-29', date: '2026-04-23', description: 'Side project bonus', categoryId: 'cat-10', type: 'income',  amount: 280 },
    { id: 'tx-30', date: '2026-04-20', description: 'Doctor visit',       categoryId: 'cat-5',  type: 'expense', amount: 55 },
  ]);

  readonly transactions = this._transactions.asReadonly();

  // ─── Goals ─────────────────────────────────────────────────────────────────

  private readonly _goals = signal<Goal[]>([
    { id: 'goal-1', name: 'Emergency Fund',  target: 10000, saved: 7500, deadline: '2026-12-31', note: '6 months of expenses' },
    { id: 'goal-2', name: 'Summer Vacation', target: 3000,  saved: 1200, deadline: '2026-07-01', note: 'Trip to Portugal 🇵🇹' },
    { id: 'goal-3', name: 'New Laptop',      target: 1500,  saved: 1500, deadline: null,         note: 'MacBook Pro M4' },
    { id: 'goal-4', name: 'Home Renovation', target: 15000, saved: 3200, deadline: '2027-06-01', note: 'Kitchen + bathroom remodel' },
    { id: 'goal-5', name: 'Investment Seed', target: 5000,  saved: 820,  deadline: null,         note: 'Index fund starting capital' },
  ]);

  readonly goals = this._goals.asReadonly();

  // ─── Goal Contributions ────────────────────────────────────────────────────

  private readonly _contributions = signal<GoalContribution[]>([
    { id: 'c-1',  goalId: 'goal-1', date: '2026-05-01', amount: 500,  note: 'Monthly transfer' },
    { id: 'c-2',  goalId: 'goal-1', date: '2026-04-01', amount: 500,  note: 'Monthly transfer' },
    { id: 'c-3',  goalId: 'goal-1', date: '2026-03-01', amount: 500,  note: 'Monthly transfer' },
    { id: 'c-4',  goalId: 'goal-1', date: '2026-02-01', amount: 750,  note: 'Tax return bonus' },
    { id: 'c-5',  goalId: 'goal-1', date: '2026-01-01', amount: 500 },
    { id: 'c-6',  goalId: 'goal-1', date: '2025-12-01', amount: 500 },
    { id: 'c-7',  goalId: 'goal-2', date: '2026-05-10', amount: 300,  note: 'Savings top-up' },
    { id: 'c-8',  goalId: 'goal-2', date: '2026-04-10', amount: 300 },
    { id: 'c-9',  goalId: 'goal-2', date: '2026-03-10', amount: 300 },
    { id: 'c-10', goalId: 'goal-2', date: '2026-02-10', amount: 300 },
    { id: 'c-11', goalId: 'goal-4', date: '2026-05-15', amount: 200 },
    { id: 'c-12', goalId: 'goal-4', date: '2026-04-15', amount: 300 },
    { id: 'c-13', goalId: 'goal-4', date: '2026-03-15', amount: 500,  note: 'Extra savings' },
    { id: 'c-14', goalId: 'goal-4', date: '2026-02-15', amount: 200 },
  ]);

  readonly contributions = this._contributions.asReadonly();

  // ─── Mutation helpers ──────────────────────────────────────────────────────

  addTransaction(tx: Transaction): void {
    this._transactions.update(list => [tx, ...list]);
  }

  deleteTransaction(id: string): void {
    this._transactions.update(list => list.filter(t => t.id !== id));
  }

  toggleCategoryRecurring(id: string): void {
    this._categories.update(list =>
      list.map(c => c.id === id ? { ...c, recurring: !c.recurring } : c)
    );
  }

  addGoalContribution(contribution: GoalContribution): void {
    this._contributions.update(list => [contribution, ...list]);
    this._goals.update(list =>
      list.map(g => g.id === contribution.goalId
        ? { ...g, saved: g.saved + contribution.amount }
        : g
      )
    );
  }
}
