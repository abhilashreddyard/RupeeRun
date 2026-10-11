import React, { useState } from 'react';
import {
  FastForward,
  Sliders,
  Zap,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Plus,
  Pause,
  Play,
} from 'lucide-react';
import {
  FinancialMetrics,
  FixedCommitment,
  PersonaPreset,
  SavingsGoal,
  SubscriptionItem,
  Transaction,
  TransactionCategory,
  UnexpectedEvent,
  WhatIfDecision,
} from '../types/finance';
import { PERSONA_PRESETS, WHAT_IF_TEMPLATES } from '../data/presets';
import { TrajectoryChart } from './TrajectoryChart';
import { SavingsGoalProgressRing } from './SavingsGoalProgressRing';
import { FinancialCopilotWidget } from './FinancialCopilotWidget';

interface CockpitViewProps {
  currentDay: number;
  activePresetId: string;
  metrics: FinancialMetrics;
  simulatedMetrics: FinancialMetrics;
  whatIfDecision: WhatIfDecision;
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  savingsGoals: SavingsGoal[];
  unexpectedEvents: UnexpectedEvent[];
  onSelectPreset: (preset: PersonaPreset) => void;
  onAdvanceDay: () => void;
  onTriggerShockEvent: (event: UnexpectedEvent) => void;
  onQuickWhatIfChange: (decision: WhatIfDecision) => void;
  onCommitWhatIf: () => void;
  onNavigateTab: (tab: 'cockpit' | 'whatif' | 'timeline' | 'commitments' | 'ledger') => void;
  onQuickAddExpense: (tx: Omit<Transaction, 'id'>) => void;
  onToggleSubscription: (id: string) => void;
  onUpdateSavingsGoal: (id: string, deltaSaved: number) => void;
  onUpdateEmergencyBuffer: (delta: number) => void;
}

export const CockpitView: React.FC<CockpitViewProps> = ({
  currentDay,
  activePresetId,
  metrics,
  simulatedMetrics,
  whatIfDecision,
  commitments,
  subscriptions,
  savingsGoals,
  unexpectedEvents,
  onSelectPreset,
  onAdvanceDay,
  onTriggerShockEvent,
  onQuickWhatIfChange,
  onCommitWhatIf,
  onNavigateTab,
  onQuickAddExpense,
  onToggleSubscription,
  onUpdateSavingsGoal,
  onUpdateEmergencyBuffer,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState<TransactionCategory>('Food & Dining');
  const [showSimOverlayOnChart, setShowSimOverlayOnChart] = useState(true);

  const handleQuickSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(quickAmount);
    if (!quickTitle.trim() || !amt || amt <= 0) return;
    onQuickAddExpense({
      day: currentDay,
      title: quickTitle.trim(),
      amount: amt,
      category: quickCategory,
      type: 'expense',
      isEssential: false,
    });
    setQuickTitle('');
    setQuickAmount('');
  };

  const nextUnresolvedEvent =
    unexpectedEvents.find(e => !e.resolved && e.day >= currentDay) ||
    unexpectedEvents.find(e => !e.resolved) ||
    unexpectedEvents[0];

  const spendAllocationTotal = Math.max(
    1,
    metrics.spentToDate +
      metrics.lockedFundsTotal +
      metrics.savingsAllocated +
      Math.max(0, metrics.freeSpendablePool)
  );

  const pctSpent = Math.round((metrics.spentToDate / spendAllocationTotal) * 100);
  const pctLocked = Math.round((metrics.lockedFundsTotal / spendAllocationTotal) * 100);
  const pctSaved = Math.round((metrics.savingsAllocated / spendAllocationTotal) * 100);
  const pctFree = Math.max(0, 100 - pctSpent - pctLocked - pctSaved);

  return (
    <div className="space-y-6">
      {/* Top Scenario Bar & Day Progression Controller */}
      <div className="p-5 bg-[#131C2E] border border-slate-800 rounded-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-sky-400 font-semibold">
              DAY {currentDay} OF 30 ({metrics.remainingDays} DAYS LEFT)
            </span>
            <span>·</span>
            <span>BASE BUDGET: ₹{metrics.baseBudget.toLocaleString('en-IN')}</span>
            {metrics.extraIncomeToDate > 0 && (
              <>
                <span>·</span>
                <span className="text-emerald-400">
                  +₹{metrics.extraIncomeToDate.toLocaleString('en-IN')} GIG INFLOW
                </span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            30-Day ₹10,000 Financial Command Cockpit
          </h1>
        </div>

        {/* Persona Switcher + Advance Day Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-[#090D16] border border-slate-800 rounded-lg">
            {PERSONA_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activePresetId === preset.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.name.split(' (')[0]}
              </button>
            ))}
          </div>

          {nextUnresolvedEvent && (
            <button
              onClick={() => onTriggerShockEvent(nextUnresolvedEvent)}
              className="px-3.5 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Unexpected Event (D{nextUnresolvedEvent.day})</span>
            </button>
          )}

          <button
            onClick={onAdvanceDay}
            disabled={currentDay >= 30}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{currentDay >= 30 ? 'Day 30 Reached' : `Advance Day (+1)`}</span>
          </button>
        </div>
      </div>

      {/* 6-Column Interconnected KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* 1. Liquid Balance */}
        <div className="p-4 bg-[#131C2E] border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Remaining Liquid Cash</div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            ₹{metrics.liquidBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            Spent ₹{metrics.spentToDate.toLocaleString('en-IN')} so far
          </div>
        </div>

        {/* 2. Locked Commitments & Subs */}
        <div className="p-4 bg-[#131C2E] border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Locked Bills & Subs</div>
          <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
            ₹{metrics.lockedFundsTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            ₹{metrics.upcomingCommitmentsTotal} bills · ₹{metrics.upcomingSubscriptionsTotal} subs
          </div>
        </div>

        {/* 3. Free Spendable Pool */}
        <div className="p-4 bg-[#131C2E] border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">True Free Spendable</div>
          <div
            className={`text-2xl font-mono font-bold tabular-nums ${
              metrics.freeSpendablePool < 0 ? 'text-rose-400' : 'text-sky-400'
            }`}
          >
            ₹{metrics.freeSpendablePool.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            After subtracting locked obligations
          </div>
        </div>

        {/* 4. Safe-to-Spend Daily Allowance */}
        <div className="p-4 bg-[#131C2E] border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Safe Daily Allowance</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            ₹{metrics.safeDailyAllowance.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            Current avg burn: ₹{metrics.currentDailyBurnAvg}/day
          </div>
        </div>

        {/* 5. Protected Savings & Buffer */}
        <div className="p-4 bg-[#131C2E] border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Savings & Shock Shield</div>
          <div className="text-2xl font-mono font-bold text-indigo-400 tabular-nums">
            ₹{metrics.savingsAllocated.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            Includes ₹{metrics.emergencyBuffer} emergency buffer
          </div>
        </div>

        {/* 6. Financial Health & Risk */}
        <div className="p-4 bg-[#131C2E] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Financial Health</span>
            <span
              className={`font-mono font-semibold ${
                metrics.riskLevel === 'LOW RISK'
                  ? 'text-emerald-400'
                  : metrics.riskLevel === 'MODERATE RISK'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {metrics.riskLevel}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {metrics.financialHealthScore}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            {metrics.projectedZeroCashDay
              ? `Overdraft risk on Day ${metrics.projectedZeroCashDay}`
              : `Day 30 forecast: +₹${metrics.projectedEndOfMonthBalance}`}
          </div>
        </div>
      </div>

      {/* ₹10,000 Interconnected Allocation Bar */}
      <div className="p-5 bg-[#131C2E] border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">
            Interconnected ₹10,000 Capital Allocation Breakdown
          </span>
          <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums text-slate-300">
            <span>
              <strong className="text-rose-400">Spent:</strong> ₹{metrics.spentToDate} ({pctSpent}%)
            </span>
            <span>·</span>
            <span>
              <strong className="text-amber-400">Locked Bills/Subs:</strong> ₹{metrics.lockedFundsTotal} ({pctLocked}%)
            </span>
            <span>·</span>
            <span>
              <strong className="text-indigo-400">Protected Savings:</strong> ₹{metrics.savingsAllocated} ({pctSaved}%)
            </span>
            <span>·</span>
            <span>
              <strong className="text-emerald-400">Free Runway:</strong> ₹{Math.max(0, metrics.freeSpendablePool)} ({pctFree}%)
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-[#090D16] rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${pctSpent}%` }}
            className="bg-rose-500 h-full transition-all duration-200"
            title={`Spent to date: ₹${metrics.spentToDate}`}
          />
          <div
            style={{ width: `${pctLocked}%` }}
            className="bg-amber-400 h-full transition-all duration-200"
            title={`Locked commitments & subscriptions: ₹${metrics.lockedFundsTotal}`}
          />
          <div
            style={{ width: `${pctSaved}%` }}
            className="bg-indigo-500 h-full transition-all duration-200"
            title={`Protected savings & buffer: ₹${metrics.savingsAllocated}`}
          />
          <div
            style={{ width: `${pctFree}%` }}
            className="bg-emerald-400 h-full transition-all duration-200"
            title={`Free spendable runway: ₹${Math.max(0, metrics.freeSpendablePool)}`}
          />
        </div>
      </div>

      {/* Main Two-Column Cockpit Split: 30-Day Runway & Quick Decision Simulator (8 cols) + Health & Action Center (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: 30-Day Trajectory Chart + Embedded Quick What-If Strip */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  30-Day Cash Runway & Commitment Impact Curve
                </h2>
                <p className="text-xs text-slate-400">
                  Visualizing actual balance (Days 1–{currentDay}), scheduled commitment drops, and projected Day 30 finish
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSimOverlayOnChart(!showSimOverlayOnChart)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                    showSimOverlayOnChart
                      ? 'bg-sky-500/15 border-sky-400 text-sky-300'
                      : 'bg-[#090D16] border-slate-800 text-slate-400'
                  }`}
                >
                  {showSimOverlayOnChart ? 'Showing What-If Curve' : 'Show What-If Overlay'}
                </button>
                <button
                  onClick={() => onNavigateTab('whatif')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090D16] border border-slate-700 hover:border-slate-500 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <TrajectoryChart
              baselineProjections={metrics.dailyProjections}
              simulatedProjections={
                showSimOverlayOnChart ? simulatedMetrics.dailyProjections : null
              }
              currentDay={currentDay}
              height={250}
            />

            {/* Inline Quick What-If Decision Tester */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-white">
                    Instant Decision Simulator (Previewing: "{whatIfDecision.title}" — ₹{whatIfDecision.amount})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-slate-400">
                    Daily Limit:{' '}
                    <strong className="text-white">
                      ₹{metrics.safeDailyAllowance} → ₹{simulatedMetrics.safeDailyAllowance}/day
                    </strong>
                  </span>
                  <span>·</span>
                  <span className="text-slate-400">
                    Day 30 EOM:{' '}
                    <strong
                      className={
                        simulatedMetrics.projectedEndOfMonthBalance < 0
                          ? 'text-rose-400'
                          : 'text-sky-400'
                      }
                    >
                      ₹{simulatedMetrics.projectedEndOfMonthBalance.toLocaleString('en-IN')}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {WHAT_IF_TEMPLATES.slice(0, 4).map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      onQuickWhatIfChange({
                        ...tpl.decision,
                        triggerDay: Math.max(currentDay, tpl.decision.triggerDay),
                      });
                      setShowSimOverlayOnChart(true);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                      whatIfDecision.title === tpl.decision.title
                        ? 'bg-sky-500/15 border-sky-400 text-sky-300 font-medium'
                        : 'bg-[#090D16] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {tpl.label} (₹{tpl.decision.amount})
                  </button>
                ))}
                <button
                  onClick={onCommitWhatIf}
                  className="ml-auto px-3.5 py-1.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Commit Scenario</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Left Row: Quick Expense Logger & Active Subscriptions Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Spend Logger */}
            <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Quick Day-{currentDay} Expense Logger
                </h3>
                <span className="text-xs font-mono text-emerald-400 tabular-nums">
                  Safe: ₹{metrics.safeDailyAllowance}/day
                </span>
              </div>

              <form onSubmit={handleQuickSpendSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="What did you spend on? (e.g., Cold Coffee)"
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="Amount (₹)"
                    value={quickAmount}
                    onChange={e => setQuickAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                  />
                  <select
                    value={quickCategory}
                    onChange={e => setQuickCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transport & Metro">Transport & Metro</option>
                    <option value="Social & Hangouts">Social & Hangouts</option>
                    <option value="Shopping & Essentials">Shopping & Essentials</option>
                  </select>
                </div>

                {Number(quickAmount) > 0 && (
                  <div className="text-[11px] font-mono text-amber-300 tabular-nums">
                    Consequence: Reduces daily allowance by -₹
                    {Math.round(Number(quickAmount) / metrics.remainingDays)}/day for remaining{' '}
                    {metrics.remainingDays} days.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense & Recalculate Runway</span>
                </button>
              </form>
            </div>

            {/* Upcoming Subscription Kill-Switch Preview */}
            <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Upcoming Subscriptions (Quick Kill-Switch)
                </h3>
                <button
                  onClick={() => onNavigateTab('commitments')}
                  className="text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Manage All
                </button>
              </div>

              <div className="space-y-2">
                {subscriptions
                  .filter(s => !s.isSettledThisMonth)
                  .slice(0, 3)
                  .map(sub => (
                    <div
                      key={sub.id}
                      className="p-2.5 bg-[#090D16] border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{sub.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                          Day {sub.billingDay} · ₹{sub.amount}/mo · Usage {sub.usageScore}%
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleSubscription(sub.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          sub.status === 'active'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25'
                        }`}
                      >
                        {sub.status === 'active' ? (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: 30-Day Savings Goal Progress Ring + Multi-Factor Financial Health Breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SavingsGoalProgressRing
            savingsGoals={savingsGoals}
            emergencyBuffer={metrics.emergencyBuffer}
            freeSpendablePool={metrics.freeSpendablePool}
            safeDailyAllowance={metrics.safeDailyAllowance}
            remainingDays={metrics.remainingDays}
            onContributeToGoal={onUpdateSavingsGoal}
            onNavigateToGoals={() => onNavigateTab('commitments')}
          />

          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Financial Health & Risk Diagnostic
                  </h2>
                  <p className="text-xs text-slate-400">
                    5-factor real-time weighted telemetry
                  </p>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-xl font-bold text-white">
                    {metrics.financialHealthScore}/100
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      metrics.riskLevel === 'LOW RISK'
                        ? 'text-emerald-400'
                        : metrics.riskLevel === 'MODERATE RISK'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {metrics.riskLevel}
                  </div>
                </div>
              </div>

              {/* 5 Weighted Sub-Factors */}
              <div className="space-y-3.5">
                {metrics.healthFactors.map(factor => (
                  <div key={factor.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">
                        {factor.name}{' '}
                        <span className="text-slate-500 font-mono">({factor.weight}%)</span>
                      </span>
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          factor.status === 'NOMINAL'
                            ? 'text-emerald-400'
                            : factor.status === 'TIGHTENING'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {factor.score}/100 · {factor.status}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#090D16] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          factor.status === 'NOMINAL'
                            ? 'bg-emerald-400'
                            : factor.status === 'TIGHTENING'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {factor.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-4 bg-[#090D16] border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="font-semibold">DECISION INTELLIGENCE ADVISORIES</span>
              </div>
              <div className="space-y-2">
                {metrics.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                    {idx + 1}. {rec}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Fintech Copilot & 30-Day Survival Challenges */}
      <FinancialCopilotWidget
        currentDay={currentDay}
        metrics={metrics}
        subscriptions={subscriptions}
        onPauseLowestValueSub={onToggleSubscription}
        onLockEmergencyShield={() => onUpdateEmergencyBuffer(200)}
      />
    </div>
  );
};
