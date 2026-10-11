import React, { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';
import {
  FinancialMetrics,
  FixedCommitment,
  PersonaPreset,
  SavingsGoal,
  ShockOption,
  SubscriptionItem,
  Transaction,
  UnexpectedEvent,
  WhatIfDecision,
} from '../types/finance';
import { useFinancialStore } from '../hooks/useFinancialStore';
import { calculateFinancialMetrics } from '../utils/financialEngine';

export type ActiveTab = 'cockpit' | 'whatif' | 'timeline' | 'commitments' | 'ledger';

export interface FinancialContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activePresetId: string;
  currentDay: number;
  baseBudget: number;
  emergencyBuffer: number;
  transactions: Transaction[];
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  savingsGoals: SavingsGoal[];
  unexpectedEvents: UnexpectedEvent[];
  whatIfDecision: WhatIfDecision;
  setWhatIfDecision: (decision: WhatIfDecision) => void;
  baselineMetrics: FinancialMetrics;
  simulatedMetrics: FinancialMetrics;
  activeShockModalEvent: UnexpectedEvent | null;
  setActiveShockModalEvent: (evt: UnexpectedEvent | null) => void;
  toastMessage: string | null;
  triggerToast: (msg: string) => void;
  handleSelectPreset: (preset: PersonaPreset) => void;
  handleAdvanceDay: () => void;
  handleJumpToDay: (targetDay: number) => void;
  handleResolveShockEvent: (eventId: string, option: ShockOption) => void;
  handleCommitWhatIf: () => void;
  handleToggleCommitmentPaid: (id: string) => void;
  handleAddCommitment: (cm: Omit<FixedCommitment, 'id'>) => void;
  handleToggleSubscription: (id: string) => void;
  handleAddSubscription: (sub: Omit<SubscriptionItem, 'id'>) => void;
  handleUpdateSavingsGoal: (id: string, deltaSaved: number) => void;
  handleUpdateEmergencyBuffer: (delta: number) => void;
  handleAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  handleDeleteTransaction: (id: string) => void;
}

const FinancialContext = createContext<FinancialContextValue | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cockpit');
  const [activeShockModalEvent, setActiveShockModalEvent] = useState<UnexpectedEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    activePresetId,
    currentDay,
    setCurrentDay,
    baseBudget,
    emergencyBuffer,
    setEmergencyBuffer,
    transactions,
    setTransactions,
    commitments,
    setCommitments,
    subscriptions,
    setSubscriptions,
    savingsGoals,
    setSavingsGoals,
    unexpectedEvents,
    whatIfDecision,
    setWhatIfDecision,
    selectPreset,
    resolveShockEvent,
  } = useFinancialStore();

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const baselineMetrics = useMemo(
    () =>
      calculateFinancialMetrics(
        {
          currentDay,
          baseBudget,
          emergencyBuffer,
          transactions,
          commitments,
          subscriptions,
          savingsGoals,
        },
        null
      ),
    [
      currentDay,
      baseBudget,
      emergencyBuffer,
      transactions,
      commitments,
      subscriptions,
      savingsGoals,
    ]
  );

  const simulatedMetrics = useMemo(
    () =>
      calculateFinancialMetrics(
        {
          currentDay,
          baseBudget,
          emergencyBuffer,
          transactions,
          commitments,
          subscriptions,
          savingsGoals,
        },
        whatIfDecision
      ),
    [
      currentDay,
      baseBudget,
      emergencyBuffer,
      transactions,
      commitments,
      subscriptions,
      savingsGoals,
      whatIfDecision,
    ]
  );

  const handleSelectPreset = useCallback(
    (preset: PersonaPreset) => {
      selectPreset(preset);
      triggerToast(`Loaded scenario: ${preset.name}`);
    },
    [selectPreset, triggerToast]
  );

  const handleAdvanceDay = useCallback(() => {
    if (currentDay >= 30) return;
    const nextDay = currentDay + 1;
    const newTxs: Transaction[] = [...transactions];

    const updatedCommitments = commitments.map(cm => {
      if (!cm.isPaid && cm.dueDay === nextDay) {
        newTxs.push({
          id: `tx-cm-${nextDay}-${cm.id}`,
          day: nextDay,
          title: `${cm.title} (Scheduled Bill)`,
          category: 'Commitments & Bills',
          amount: cm.amount,
          type: 'expense',
          isEssential: true,
        });
        return { ...cm, isPaid: true };
      }
      return cm;
    });

    const updatedSubscriptions = subscriptions.map(sub => {
      if (sub.status === 'active' && !sub.isSettledThisMonth && sub.billingDay === nextDay) {
        newTxs.push({
          id: `tx-sub-${nextDay}-${sub.id}`,
          day: nextDay,
          title: `${sub.name} Auto-Debit`,
          category: 'Subscriptions',
          amount: sub.amount,
          type: 'expense',
          isEssential: false,
        });
        return { ...sub, isSettledThisMonth: true };
      }
      return sub;
    });

    const alreadyHasDaySpend = newTxs.some(
      t =>
        t.day === nextDay &&
        t.category !== 'Commitments & Bills' &&
        t.category !== 'Subscriptions'
    );
    if (!alreadyHasDaySpend) {
      const dailySamples = [
        { title: 'Campus Canteen Lunch & Chai', category: 'Food & Dining' as const, amount: 115, isEssential: true },
        { title: 'Metro Commute & Evening Snack', category: 'Transport & Metro' as const, amount: 95, isEssential: true },
        { title: 'Quick Tiffin & Fruit Bowl', category: 'Food & Dining' as const, amount: 125, isEssential: true },
        { title: 'Shared Auto & Iced Coffee', category: 'Social & Hangouts' as const, amount: 140, isEssential: false },
      ];
      const pick = dailySamples[nextDay % dailySamples.length];
      newTxs.push({
        id: `tx-auto-${nextDay}-${Date.now()}`,
        day: nextDay,
        title: pick.title,
        category: pick.category,
        amount: pick.amount,
        type: 'expense',
        isEssential: pick.isEssential,
      });
    }

    setCommitments(updatedCommitments);
    setSubscriptions(updatedSubscriptions);
    setTransactions(newTxs);
    setCurrentDay(nextDay);

    const shockOnNextDay = unexpectedEvents.find(e => e.day === nextDay && !e.resolved);
    if (shockOnNextDay) {
      setActiveShockModalEvent(shockOnNextDay);
    } else {
      triggerToast(`Advanced to Day ${nextDay} of 30 — daily allowance & forecast updated.`);
    }
  }, [
    currentDay,
    transactions,
    commitments,
    subscriptions,
    unexpectedEvents,
    setCommitments,
    setSubscriptions,
    setTransactions,
    setCurrentDay,
    triggerToast,
  ]);

  const handleJumpToDay = useCallback(
    (targetDay: number) => {
      const clamped = Math.max(1, Math.min(30, targetDay));
      setCurrentDay(clamped);
      triggerToast(`Timeline active day set to Day ${clamped} of 30.`);
    },
    [setCurrentDay, triggerToast]
  );

  const handleResolveShockEvent = useCallback(
    (eventId: string, option: ShockOption) => {
      const label = resolveShockEvent(eventId, option);
      setActiveShockModalEvent(null);
      if (label) {
        triggerToast(`Resolved life event: "${label}" applied to your 30-day ledger.`);
      }
    },
    [resolveShockEvent, triggerToast]
  );

  const handleCommitWhatIf = useCallback(() => {
    const d = whatIfDecision;
    const trigDay = Math.max(currentDay, Math.min(30, d.triggerDay || currentDay));

    if (d.type === 'one_time_expense') {
      setTransactions(prev => [
        ...prev,
        {
          id: `tx-sim-commit-${Date.now()}`,
          day: trigDay,
          title: d.title,
          category: d.category,
          amount: d.amount,
          type: 'expense',
          isEssential: d.isEssential,
          note: 'Committed from What-If Simulator',
        },
      ]);
      triggerToast(`Committed "${d.title}" (-₹${d.amount}) to Day ${trigDay}.`);
    } else if (d.type === 'recurring_daily') {
      setTransactions(prev => [
        ...prev,
        {
          id: `tx-sim-habit-${Date.now()}`,
          day: currentDay,
          title: `${d.title} (Day ${currentDay} Entry)`,
          category: d.category,
          amount: d.amount,
          type: 'expense',
          isEssential: d.isEssential,
          note: 'Recurring daily habit started via What-If Simulator',
        },
      ]);
      setCommitments(prev => [
        ...prev,
        {
          id: `cm-habit-${Date.now()}`,
          title: `${d.title} (Remaining Cycle Reserve)`,
          category: 'Housing & Mess',
          amount: d.amount * Math.max(1, 30 - currentDay),
          dueDay: 30,
          isPaid: false,
          mandatory: false,
        },
      ]);
      triggerToast(`Committed daily habit "${d.title}" (₹${d.amount}/day) across remaining days.`);
    } else if (d.type === 'new_subscription') {
      setSubscriptions(prev => [
        ...prev,
        {
          id: `sub-sim-${Date.now()}`,
          name: d.title,
          category: 'Entertainment',
          amount: d.amount,
          billingDay: trigDay,
          status: 'active',
          isSettledThisMonth: false,
          usageScore: 70,
        },
      ]);
      triggerToast(`Added new subscription "${d.title}" (₹${d.amount}/mo due Day ${trigDay}).`);
    } else if (d.type === 'pause_subscriptions') {
      let saved = 0;
      setSubscriptions(prev =>
        prev.map(sub => {
          if (sub.status === 'active' && !sub.isSettledThisMonth && saved < d.amount) {
            saved += sub.amount;
            return { ...sub, status: 'paused' as const };
          }
          return sub;
        })
      );
      triggerToast(`Paused upcoming subscriptions — reclaimed ₹${saved} into Free Spendable Pool!`);
    } else if (d.type === 'savings_boost') {
      if (savingsGoals.length > 0) {
        setSavingsGoals(prev =>
          prev.map((g, idx) =>
            idx === 0 ? { ...g, savedAmount: g.savedAmount + d.amount } : g
          )
        );
      } else {
        setEmergencyBuffer(prev => prev + d.amount);
      }
      triggerToast(`Locked +₹${d.amount} into Protected Savings Vaults!`);
    } else if (d.type === 'extra_income') {
      setTransactions(prev => [
        ...prev,
        {
          id: `tx-income-${Date.now()}`,
          day: currentDay,
          title: d.title,
          category: 'Extra Income',
          amount: d.amount,
          type: 'income',
          isEssential: true,
          note: 'Side-gig inflow committed from What-If Simulator',
        },
      ]);
      triggerToast(`Added +₹${d.amount} extra income inflow to your budget!`);
    }
  }, [
    whatIfDecision,
    currentDay,
    savingsGoals.length,
    setTransactions,
    setCommitments,
    setSubscriptions,
    setSavingsGoals,
    setEmergencyBuffer,
    triggerToast,
  ]);

  const handleToggleCommitmentPaid = useCallback(
    (id: string) => {
      const target = commitments.find(c => c.id === id);
      if (!target) return;
      const nextPaid = !target.isPaid;
      setCommitments(prev =>
        prev.map(c => (c.id === id ? { ...c, isPaid: nextPaid } : c))
      );
      if (nextPaid) {
        setTransactions(prev => [
          ...prev,
          {
            id: `tx-cm-paid-${Date.now()}`,
            day: currentDay,
            title: target.title,
            category: 'Commitments & Bills',
            amount: target.amount,
            type: 'expense',
            isEssential: true,
          },
        ]);
        triggerToast(`Settled commitment: ${target.title} (₹${target.amount}).`);
      }
    },
    [commitments, currentDay, setCommitments, setTransactions, triggerToast]
  );

  const handleAddCommitment = useCallback(
    (cm: Omit<FixedCommitment, 'id'>) => {
      setCommitments(prev => [...prev, { ...cm, id: `cm-${Date.now()}` }]);
      triggerToast(`Locked new commitment: ${cm.title} (₹${cm.amount} due Day ${cm.dueDay}).`);
    },
    [setCommitments, triggerToast]
  );

  const handleToggleSubscription = useCallback(
    (id: string) => {
      const target = subscriptions.find(s => s.id === id);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'paused' : 'active';
      setSubscriptions(prev =>
        prev.map(s => (s.id === id ? { ...s, status: nextStatus } : s))
      );
      triggerToast(
        nextStatus === 'paused'
          ? `Paused ${target.name} — freed ₹${target.amount} back into spendable runway.`
          : `Resumed ${target.name} (₹${target.amount}/mo locked).`
      );
    },
    [subscriptions, setSubscriptions, triggerToast]
  );

  const handleAddSubscription = useCallback(
    (sub: Omit<SubscriptionItem, 'id'>) => {
      setSubscriptions(prev => [...prev, { ...sub, id: `sub-${Date.now()}` }]);
      triggerToast(`Added subscription: ${sub.name} (₹${sub.amount}/mo).`);
    },
    [setSubscriptions, triggerToast]
  );

  const handleUpdateSavingsGoal = useCallback(
    (id: string, deltaSaved: number) => {
      setSavingsGoals(prev =>
        prev.map(g =>
          g.id === id
            ? { ...g, savedAmount: Math.max(0, g.savedAmount + deltaSaved) }
            : g
        )
      );
      triggerToast(
        deltaSaved > 0
          ? `Allocated +₹${deltaSaved} to savings goal.`
          : `Released ₹${Math.abs(deltaSaved)} from savings goal to liquid cash.`
      );
    },
    [setSavingsGoals, triggerToast]
  );

  const handleUpdateEmergencyBuffer = useCallback(
    (delta: number) => {
      setEmergencyBuffer(prev => Math.max(0, prev + delta));
      triggerToast(
        delta > 0
          ? `Locked +₹${delta} into Emergency Shock Buffer.`
          : `Released ₹${Math.abs(delta)} from Emergency Buffer to spendable cash.`
      );
    },
    [setEmergencyBuffer, triggerToast]
  );

  const handleAddTransaction = useCallback(
    (tx: Omit<Transaction, 'id'>) => {
      setTransactions(prev => [...prev, { ...tx, id: `tx-${Date.now()}` }]);
      triggerToast(
        `${tx.type === 'income' ? 'Added inflow' : 'Logged expense'}: ${tx.title} (₹${tx.amount}).`
      );
    },
    [setTransactions, triggerToast]
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
      triggerToast('Transaction removed and 30-day metrics recalculated.');
    },
    [setTransactions, triggerToast]
  );

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      activePresetId,
      currentDay,
      baseBudget,
      emergencyBuffer,
      transactions,
      commitments,
      subscriptions,
      savingsGoals,
      unexpectedEvents,
      whatIfDecision,
      setWhatIfDecision,
      baselineMetrics,
      simulatedMetrics,
      activeShockModalEvent,
      setActiveShockModalEvent,
      toastMessage,
      triggerToast,
      handleSelectPreset,
      handleAdvanceDay,
      handleJumpToDay,
      handleResolveShockEvent,
      handleCommitWhatIf,
      handleToggleCommitmentPaid,
      handleAddCommitment,
      handleToggleSubscription,
      handleAddSubscription,
      handleUpdateSavingsGoal,
      handleUpdateEmergencyBuffer,
      handleAddTransaction,
      handleDeleteTransaction,
    }),
    [
      activeTab,
      activePresetId,
      currentDay,
      baseBudget,
      emergencyBuffer,
      transactions,
      commitments,
      subscriptions,
      savingsGoals,
      unexpectedEvents,
      whatIfDecision,
      setWhatIfDecision,
      baselineMetrics,
      simulatedMetrics,
      activeShockModalEvent,
      toastMessage,
      triggerToast,
      handleSelectPreset,
      handleAdvanceDay,
      handleJumpToDay,
      handleResolveShockEvent,
      handleCommitWhatIf,
      handleToggleCommitmentPaid,
      handleAddCommitment,
      handleToggleSubscription,
      handleAddSubscription,
      handleUpdateSavingsGoal,
      handleUpdateEmergencyBuffer,
      handleAddTransaction,
      handleDeleteTransaction,
    ]
  );

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export function useFinancialContext(): FinancialContextValue {
  const ctx = useContext(FinancialContext);
  if (!ctx) {
    throw new Error('useFinancialContext must be used within a FinancialProvider');
  }
  return ctx;
}
