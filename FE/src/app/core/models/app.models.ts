export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  note?: string;
  recurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  recurring: boolean;
  budget: number;
  spent: number;
  color: string;
  archived?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string | null;
  note: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  date: string;
  amount: number;
  note?: string;
}

export interface DashboardTotals {
  income: number;
  expense: number;
  net: number;
  budgetTotal: number;
  budgetUsed: number;
}

export interface CashFlowPoint {
  label: string;
  income: number;
  expense: number;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  include: {
    transactions: boolean;
    categories: boolean;
    goals: boolean;
    charts: boolean;
  };
  dateRange: {
    from: string;
    to: string;
  };
}

export interface TransactionFilters {
  search?: string;
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
  month?: string;
}
