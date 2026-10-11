import { TransactionCategory } from '../types/finance';

export const STORAGE_KEY = 'rupeerun_v1_state';

export const DEFAULT_MONTHLY_BUDGET = 10000;
export const TOTAL_CYCLE_DAYS = 30;

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Transport & Metro',
  'Social & Hangouts',
  'Shopping & Essentials',
  'Commitments & Bills',
  'Subscriptions',
  'Unexpected Shock',
  'Savings Transfer',
  'Extra Income',
];

export const NAVIGATION_TABS = [
  { id: 'cockpit', label: 'Cockpit', shortcut: '1' },
  { id: 'whatif', label: 'What-If Lab', shortcut: '2' },
  { id: 'timeline', label: '30-Day Timeline', shortcut: '3' },
  { id: 'commitments', label: 'Commitments & Goals', shortcut: '4' },
  { id: 'ledger', label: 'Smart Ledger', shortcut: '5' },
] as const;

export const SURVIVAL_CHALLENGES = [
  {
    id: 'chal-zero-spend',
    title: 'Zero-Spend Weekday Sprint',
    description: 'Log ₹0 in discretionary wants today by relying on hostel mess & campus transit.',
    rewardAllowanceBoost: '+₹15/day safe allowance preservation',
    targetMetric: '0 Discretionary Spend Today',
  },
  {
    id: 'chal-sub-audit',
    title: 'Subscription Kill-Switch Audit',
    description: 'Pause at least 1 recurring subscription with <50% usage score before its billing date.',
    rewardAllowanceBoost: '+₹9 to +₹25/day reclaimed runway',
    targetMetric: 'Pause 1 Low-Usage Sub',
  },
  {
    id: 'chal-shock-shield',
    title: '₹1,000 Shock Shield Builder',
    description: 'Maintain at least ₹1,000 in your Emergency Shock Buffer to survive unexpected mid-month events.',
    rewardAllowanceBoost: '+12 Financial Health Score points',
    targetMetric: '₹1,000+ Emergency Buffer',
  },
] as const;
