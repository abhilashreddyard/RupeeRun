import {
  FixedCommitment,
  SavingsGoal,
  SubscriptionItem,
  Transaction,
  UnexpectedEvent,
} from '../types/finance';
import { STORAGE_KEY } from '../constants/config';

export interface PersistedFinancialState {
  activePresetId: string;
  currentDay: number;
  baseBudget: number;
  emergencyBuffer: number;
  transactions: Transaction[];
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  savingsGoals: SavingsGoal[];
  unexpectedEvents: UnexpectedEvent[];
}

export function loadPersistedState(): PersistedFinancialState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedFinancialState;
    if (parsed && typeof parsed.currentDay === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedFinancialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage quota or private browsing errors
  }
}

export function exportLedgerToCSV(transactions: Transaction[], currentDay: number): void {
  const headers = ['Day', 'Title', 'Category', 'Type', 'Priority', 'Amount_INR'];
  const rows = transactions.map(t => [
    `Day ${t.day}`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    t.type,
    t.isEssential ? 'Essential' : 'Discretionary',
    t.amount,
  ]);
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rupeerun_30day_ledger_day${currentDay}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
