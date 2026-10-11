/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FixedCommitment,
  PersonaPreset,
  SavingsGoal,
  ShockOption,
  SubscriptionItem,
  Transaction,
  UnexpectedEvent,
  WhatIfDecision,
} from './types/finance';
import { PERSONA_PRESETS, WHAT_IF_TEMPLATES } from './data/presets';
import { calculateFinancialMetrics } from './utils/financialEngine';
import { CockpitView } from './components/CockpitView';
import { WhatIfSandboxView } from './components/WhatIfSandboxView';
import { TimelineView } from './components/TimelineView';
import { CommitmentsAndGoalsView } from './components/CommitmentsAndGoalsView';
import { SmartLedgerView } from './components/SmartLedgerView';
import { ShockEventModal } from './components/ShockEventModal';

type ActiveTab = 'cockpit' | 'whatif' | 'timeline' | 'commitments' | 'ledger';

const STORAGE_KEY = 'rupeerun_v1_state';

export default function App() {
  const defaultPreset = PERSONA_PRESETS[0];

  const [activeTab, setActiveTab] = useState<ActiveTab>('cockpit');
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [currentDay, setCurrentDay] = useState<number>(defaultPreset.currentDay);
  const [baseBudget, setBaseBudget] = useState<number>(defaultPreset.baseBudget);
  const [emergencyBuffer, setEmergencyBuffer] = useState<number>(defaultPreset.emergencyBuffer);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultPreset.transactions);
  const [commitments, setCommitments] = useState<FixedCommitment[]>(defaultPreset.commitments);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(
    defaultPreset.subscriptions
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(defaultPreset.savingsGoals);
  const [unexpectedEvents, setUnexpectedEvents] = useState<UnexpectedEvent[]>(
    defaultPreset.unexpectedEvents
  );

  // What-If Sandbox State
  const [whatIfDecision, setWhatIfDecision] = useState<WhatIfDecision>(
    WHAT_IF_TEMPLATES[0].decision
  );

  // Active Shock Event Modal
  const [activeShockModalEvent, setActiveShockModalEvent] = useState<UnexpectedEvent | null>(
    null
  );

  // Toast Banner Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.currentDay === 'number') {
          setActivePresetId(parsed.activePresetId || defaultPreset.id);
          setCurrentDay(parsed.currentDay);
          setBaseBudget(parsed.baseBudget || 10000);
          setEmergencyBuffer(parsed.emergencyBuffer ?? defaultPreset.emergencyBuffer);
          setTransactions(parsed.transactions || defaultPreset.transactions);
          setCommitments(parsed.commitments || defaultPreset.commitments);
          setSubscriptions(parsed.subscriptions || defaultPreset.subscriptions);
          setSavingsGoals(parsed.savingsGoals || defaultPreset.savingsGoals);
          setUnexpectedEvents(parsed.unexpectedEvents || defaultPreset.unexpectedEvents);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePresetId,
          currentDay,
          baseBudget,
          emergencyBuffer,
          transactions,
          commitments,
          subscriptions,
          savingsGoals,
          unexpectedEvents,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [
    activePresetId,
    currentDay,
    baseBudget,
    emergencyBuffer,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    unexpectedEvents,
  ]);

  // Baseline & Simulated Financial Metrics
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

  // Switch Persona Preset
  const handleSelectPreset = (preset: PersonaPreset) => {
    setActivePresetId(preset.id);
    setCurrentDay(preset.currentDay);
    setBaseBudget(preset.baseBudget);
    setEmergencyBuffer(preset.emergencyBuffer);
    setTransactions(preset.transactions);
    setCommitments(preset.commitments);
    setSubscriptions(preset.subscriptions);
    setSavingsGoals(preset.savingsGoals);
    setUnexpectedEvents(preset.unexpectedEvents);
    setWhatIfDecision({
      ...WHAT_IF_TEMPLATES[0].decision,
      triggerDay: preset.currentDay,
    });
    triggerToast(`Loaded scenario: ${preset.name}`);
  };

  // Advance Day (+1 Day)
  const handleAdvanceDay = () => {
    if (currentDay >= 30) return;
    const nextDay = currentDay + 1;
    const newTxs: Transaction[] = [...transactions];

    // 1. Settle any unpaid fixed commitments due on nextDay
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

    // 2. Settle any active subscriptions billing on nextDay
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

    // 3. Log a realistic baseline daily food/commute micro-spend if none logged on nextDay yet
    const alreadyHasDaySpend = newTxs.some(
      t => t.day === nextDay && t.category !== 'Commitments & Bills' && t.category !== 'Subscriptions'
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

    // 4. Check if an unresolved unexpected life event triggers on nextDay
    const shockOnNextDay = unexpectedEvents.find(e => e.day === nextDay && !e.resolved);
    if (shockOnNextDay) {
      setActiveShockModalEvent(shockOnNextDay);
    } else {
      triggerToast(`Advanced to Day ${nextDay} of 30 — daily allowance & forecast updated.`);
    }
  };

  // Jump to any day on timeline
  const handleJumpToDay = (targetDay: number) => {
    const clamped = Math.max(1, Math.min(30, targetDay));
    setCurrentDay(clamped);
    triggerToast(`Timeline active day set to Day ${clamped} of 30.`);
  };

  // Resolve an Unexpected Life Event
  const handleResolveShockEvent = (eventId: string, option: ShockOption) => {
    const targetEvt = unexpectedEvents.find(e => e.id === eventId);
    if (!targetEvt) return;

    const newTxs = [...transactions];
    if (option.cashImpact > 0) {
      newTxs.push({
        id: `tx-shock-${Date.now()}`,
        day: currentDay,
        title: `${targetEvt.title} (${option.label.split(' (')[0]})`,
        category: 'Unexpected Shock',
        amount: option.cashImpact,
        type: 'expense',
        isEssential: true,
        note: option.healthNote,
      });
    }

    if (option.incomeAdded && option.incomeAdded > 0) {
      newTxs.push({
        id: `tx-gig-${Date.now()}`,
        day: currentDay,
        title: `${targetEvt.title}`,
        category: 'Extra Income',
        amount: option.incomeAdded,
        type: 'income',
        isEssential: true,
        note: option.healthNote,
      });
    }

    if (option.savingsImpact !== 0) {
      setEmergencyBuffer(prev => Math.max(0, prev - option.savingsImpact));
    }

    setTransactions(newTxs);
    setUnexpectedEvents(prev =>
      prev.map(e =>
        e.id === eventId ? { ...e, resolved: true, chosenOptionId: option.id } : e
      )
    );
    setActiveShockModalEvent(null);
    triggerToast(`Resolved life event: "${option.label}" applied to your 30-day ledger.`);
  };

  // Commit What-If Decision into Real State
  const handleCommitWhatIf = () => {
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
  };

  // Commitments, Subscriptions & Savings Handlers
  const handleToggleCommitmentPaid = (id: string) => {
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
  };

  const handleAddCommitment = (cm: Omit<FixedCommitment, 'id'>) => {
    setCommitments(prev => [...prev, { ...cm, id: `cm-${Date.now()}` }]);
    triggerToast(`Locked new commitment: ${cm.title} (₹${cm.amount} due Day ${cm.dueDay}).`);
  };

  const handleToggleSubscription = (id: string) => {
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
  };

  const handleAddSubscription = (sub: Omit<SubscriptionItem, 'id'>) => {
    setSubscriptions(prev => [...prev, { ...sub, id: `sub-${Date.now()}` }]);
    triggerToast(`Added subscription: ${sub.name} (₹${sub.amount}/mo).`);
  };

  const handleUpdateSavingsGoal = (id: string, deltaSaved: number) => {
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
  };

  const handleUpdateEmergencyBuffer = (delta: number) => {
    setEmergencyBuffer(prev => Math.max(0, prev + delta));
    triggerToast(
      delta > 0
        ? `Locked +₹${delta} into Emergency Shock Buffer.`
        : `Released ₹${Math.abs(delta)} from Emergency Buffer to spendable cash.`
    );
  };

  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...tx, id: `tx-${Date.now()}` }]);
    triggerToast(
      `${tx.type === 'income' ? 'Added inflow' : 'Logged expense'}: ${tx.title} (₹${tx.amount}).`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    triggerToast('Transaction removed and 30-day metrics recalculated.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#cockpit"
          onClick={e => {
            e.preventDefault();
            setActiveTab('cockpit');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
        >
          RupeeRun
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#cockpit"
            onClick={e => {
              e.preventDefault();
              setActiveTab('cockpit');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cockpit'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : ''
            }`}
          >
            Cockpit
          </a>
          <a
            href="#whatif"
            onClick={e => {
              e.preventDefault();
              setActiveTab('whatif');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'whatif'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : ''
            }`}
          >
            What-If Lab
          </a>
          <a
            href="#timeline"
            onClick={e => {
              e.preventDefault();
              setActiveTab('timeline');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'timeline'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : ''
            }`}
          >
            30-Day Timeline
          </a>
          <a
            href="#commitments"
            onClick={e => {
              e.preventDefault();
              setActiveTab('commitments');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'commitments'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : ''
            }`}
          >
            Commitments & Goals
          </a>
          <a
            href="#ledger"
            onClick={e => {
              e.preventDefault();
              setActiveTab('ledger');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'ledger'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : ''
            }`}
          >
            Smart Ledger
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('whatif')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 rounded-lg hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Simulate Decision
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar (visible only on small screens) */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-[#0F172A] border-b border-slate-800 text-xs font-medium">
        {[
          { id: 'cockpit', label: 'Cockpit' },
          { id: 'whatif', label: 'What-If Lab' },
          { id: 'timeline', label: '30-Day Timeline' },
          { id: 'commitments', label: 'Commitments & Goals' },
          { id: 'ledger', label: 'Smart Ledger' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as ActiveTab)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === item.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Live Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 bg-[#131C2E] border border-sky-400/60 text-xs font-mono text-sky-200 rounded-xl shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Main Content Container (1440px max-width desktop workspace) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'cockpit' && (
          <CockpitView
            currentDay={currentDay}
            activePresetId={activePresetId}
            metrics={baselineMetrics}
            simulatedMetrics={simulatedMetrics}
            whatIfDecision={whatIfDecision}
            commitments={commitments}
            subscriptions={subscriptions}
            savingsGoals={savingsGoals}
            unexpectedEvents={unexpectedEvents}
            onSelectPreset={handleSelectPreset}
            onAdvanceDay={handleAdvanceDay}
            onTriggerShockEvent={evt => setActiveShockModalEvent(evt)}
            onQuickWhatIfChange={setWhatIfDecision}
            onCommitWhatIf={handleCommitWhatIf}
            onNavigateTab={setActiveTab}
            onQuickAddExpense={handleAddTransaction}
            onToggleSubscription={handleToggleSubscription}
            onUpdateSavingsGoal={handleUpdateSavingsGoal}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSandboxView
            currentDay={currentDay}
            baselineMetrics={baselineMetrics}
            simulatedMetrics={simulatedMetrics}
            whatIfDecision={whatIfDecision}
            onChangeDecision={setWhatIfDecision}
            onCommitDecision={handleCommitWhatIf}
            onResetDecision={() =>
              setWhatIfDecision({
                ...WHAT_IF_TEMPLATES[0].decision,
                triggerDay: currentDay,
              })
            }
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            currentDay={currentDay}
            metrics={baselineMetrics}
            transactions={transactions}
            commitments={commitments}
            subscriptions={subscriptions}
            unexpectedEvents={unexpectedEvents}
            onAdvanceDay={handleAdvanceDay}
            onJumpToDay={handleJumpToDay}
            onTriggerShockEvent={evt => setActiveShockModalEvent(evt)}
          />
        )}

        {activeTab === 'commitments' && (
          <CommitmentsAndGoalsView
            currentDay={currentDay}
            metrics={baselineMetrics}
            commitments={commitments}
            subscriptions={subscriptions}
            savingsGoals={savingsGoals}
            emergencyBuffer={emergencyBuffer}
            onToggleCommitmentPaid={handleToggleCommitmentPaid}
            onAddCommitment={handleAddCommitment}
            onToggleSubscription={handleToggleSubscription}
            onAddSubscription={handleAddSubscription}
            onUpdateSavingsGoal={handleUpdateSavingsGoal}
            onUpdateEmergencyBuffer={handleUpdateEmergencyBuffer}
          />
        )}

        {activeTab === 'ledger' && (
          <SmartLedgerView
            currentDay={currentDay}
            metrics={baselineMetrics}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            RupeeRun — 30-Day ₹10,000 Gen Z Personal Finance & Decision Simulation Cockpit
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSelectPreset(PERSONA_PRESETS[0])}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Reset to Default Day 8 State
            </button>
            <span>·</span>
            <button
              onClick={() => handleSelectPreset(PERSONA_PRESETS[2])}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Start Fresh Day 1
            </button>
          </div>
        </div>
      </footer>

      {/* Unexpected Life Event Resolution Modal */}
      <ShockEventModal
        event={activeShockModalEvent}
        onResolve={handleResolveShockEvent}
        onDismiss={() => setActiveShockModalEvent(null)}
        liquidBalance={baselineMetrics.liquidBalance}
        emergencyBuffer={emergencyBuffer}
        safeDailyAllowance={baselineMetrics.safeDailyAllowance}
        remainingDays={baselineMetrics.remainingDays}
      />
    </div>
  );
}
