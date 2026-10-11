export type TransactionCategory =
  | 'Food & Dining'
  | 'Transport & Metro'
  | 'Commitments & Bills'
  | 'Subscriptions'
  | 'Social & Hangouts'
  | 'Shopping & Essentials'
  | 'Unexpected Shock'
  | 'Savings Transfer'
  | 'Extra Income';

export type TransactionType = 'expense' | 'income' | 'savings';

export interface Transaction {
  id: string;
  day: number; // 1 to 30
  title: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  isEssential: boolean;
  note?: string;
}

export interface FixedCommitment {
  id: string;
  title: string;
  category: 'Housing & Mess' | 'Utilities & Connectivity' | 'Education & Career' | 'Transit Pass';
  amount: number;
  dueDay: number; // 1 to 30
  isPaid: boolean;
  mandatory: boolean;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  category: 'Entertainment' | 'Music & Audio' | 'Food Delivery Perk' | 'Productivity & Cloud' | 'Fitness';
  amount: number;
  billingDay: number; // 1 to 30
  status: 'active' | 'paused';
  isSettledThisMonth: boolean;
  usageScore: number; // 1-100 how much value the user gets
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  priority: 'High' | 'Medium' | 'Flexible';
  autoDailyContribution: number;
  description: string;
}

export interface ShockOption {
  id: string;
  label: string;
  description: string;
  cashImpact: number; // immediate expense from liquid cash
  savingsImpact: number; // amount pulled from savings/emergency buffer
  commitmentAdded?: {
    title: string;
    amount: number;
    dueDay: number;
  };
  incomeAdded?: number;
  healthNote: string;
}

export interface UnexpectedEvent {
  id: string;
  day: number;
  title: string;
  category: 'Tech Failure' | 'Health & Medical' | 'Social Pressure' | 'Academic / Campus' | 'Windfall / Gig';
  severity: 'High' | 'Medium' | 'Positive';
  description: string;
  resolved: boolean;
  chosenOptionId?: string;
  options: ShockOption[];
}

export interface WhatIfDecision {
  title: string;
  type: 'one_time_expense' | 'recurring_daily' | 'new_subscription' | 'pause_subscriptions' | 'savings_boost' | 'extra_income';
  amount: number;
  triggerDay: number;
  category: TransactionCategory;
  isEssential: boolean;
}

export interface DailyProjectionPoint {
  day: number;
  actualOrProjectedBalance: number;
  freeSpendableBalance: number;
  dailySpend: number;
  commitmentSettled: number;
  subscriptionSettled: number;
  isProjected: boolean;
  events: string[];
}

export interface HealthFactorBreakdown {
  name: string;
  score: number; // 0 to 100
  weight: number; // percentage weight e.g. 25
  status: 'NOMINAL' | 'TIGHTENING' | 'CRITICAL';
  detail: string;
}

export interface FinancialMetrics {
  baseBudget: number;
  extraIncomeToDate: number;
  totalInflow: number;
  spentToDate: number;
  discretionarySpentToDate: number;
  essentialSpentToDate: number;
  savingsAllocated: number;
  emergencyBuffer: number;
  liquidBalance: number;
  upcomingCommitmentsTotal: number;
  upcomingSubscriptionsTotal: number;
  lockedFundsTotal: number;
  freeSpendablePool: number;
  remainingDays: number; // including currentDay
  safeDailyAllowance: number;
  currentDailyBurnAvg: number;
  projectedEndOfMonthBalance: number;
  projectedZeroCashDay: number | null; // null if survives all 30 days
  financialHealthScore: number; // 0 to 100
  riskLevel: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL OVERDRAFT';
  riskScore: number; // 0 to 100
  healthFactors: HealthFactorBreakdown[];
  dailyProjections: DailyProjectionPoint[];
  recommendations: string[];
}

export interface PersonaPreset {
  id: string;
  name: string;
  tagline: string;
  currentDay: number;
  baseBudget: number;
  emergencyBuffer: number;
  transactions: Transaction[];
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  savingsGoals: SavingsGoal[];
  unexpectedEvents: UnexpectedEvent[];
}
