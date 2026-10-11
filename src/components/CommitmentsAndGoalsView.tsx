import React, { useState } from 'react';
import {
  Lock,
  Repeat,
  PiggyBank,
  Shield,
  Plus,
  Check,
  Pause,
  Play,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  FinancialMetrics,
  FixedCommitment,
  SavingsGoal,
  SubscriptionItem,
} from '../types/finance';

interface CommitmentsAndGoalsViewProps {
  currentDay: number;
  metrics: FinancialMetrics;
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  savingsGoals: SavingsGoal[];
  emergencyBuffer: number;
  onToggleCommitmentPaid: (id: string) => void;
  onAddCommitment: (commitment: Omit<FixedCommitment, 'id'>) => void;
  onToggleSubscription: (id: string) => void;
  onAddSubscription: (sub: Omit<SubscriptionItem, 'id'>) => void;
  onUpdateSavingsGoal: (id: string, deltaSaved: number) => void;
  onUpdateEmergencyBuffer: (delta: number) => void;
}

export const CommitmentsAndGoalsView: React.FC<CommitmentsAndGoalsViewProps> = ({
  currentDay,
  metrics,
  commitments,
  subscriptions,
  savingsGoals,
  emergencyBuffer,
  onToggleCommitmentPaid,
  onAddCommitment,
  onToggleSubscription,
  onAddSubscription,
  onUpdateSavingsGoal,
  onUpdateEmergencyBuffer,
}) => {
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDay, setNewBillDay] = useState(String(Math.min(30, currentDay + 5)));

  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [newSubDay, setNewSubDay] = useState(String(Math.min(30, currentDay + 3)));

  const activeSubsMonthlyTotal = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const pausedSubsSavings = subscriptions
    .filter(s => s.status === 'paused')
    .reduce((sum, s) => sum + s.amount, 0);

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newBillAmount);
    if (!newBillTitle.trim() || !amt || amt <= 0) return;
    onAddCommitment({
      title: newBillTitle.trim(),
      category: 'Utilities & Connectivity',
      amount: amt,
      dueDay: Math.max(1, Math.min(30, Number(newBillDay) || 15)),
      isPaid: false,
      mandatory: true,
    });
    setNewBillTitle('');
    setNewBillAmount('');
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newSubAmount);
    if (!newSubName.trim() || !amt || amt <= 0) return;
    onAddSubscription({
      name: newSubName.trim(),
      category: 'Entertainment',
      amount: amt,
      billingDay: Math.max(1, Math.min(30, Number(newSubDay) || 15)),
      status: 'active',
      isSettledThisMonth: false,
      usageScore: 65,
    });
    setNewSubName('');
    setNewSubAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Strip */}
      <div className="p-6 bg-[#131C2E] border border-slate-800 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-400">
            COMMITMENTS, SUBSCRIPTIONS & PROTECTED SAVINGS VAULTS
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Manage Locked Obligations & Goal Allocation
          </h1>
          <p className="text-sm text-slate-300">
            Every rupee locked in upcoming bills, OTT subscriptions, or savings vaults directly adjusts your Safe-to-Spend Daily Allowance (currently ₹{metrics.safeDailyAllowance}/day).
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg font-mono tabular-nums text-xs shrink-0">
          <div>
            <span className="text-slate-400 font-sans block">Upcoming Locked Bills</span>
            <span className="text-base font-bold text-amber-400">
              ₹{metrics.upcomingCommitmentsTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-sans block">Active Unsettled Subs</span>
            <span className="text-base font-bold text-indigo-400">
              ₹{metrics.upcomingSubscriptionsTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-sans block">Total Protected Savings</span>
            <span className="text-base font-bold text-emerald-400">
              ₹{metrics.savingsAllocated.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Three-Column Interconnected Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Fixed Commitments (4 cols) */}
        <div className="lg:col-span-4 bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white">
                Fixed Monthly Commitments
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {commitments.filter(c => !c.isPaid).length} UNPAID
            </span>
          </div>

          <div className="space-y-3">
            {commitments.map(cm => (
              <div
                key={cm.id}
                className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">{cm.title}</div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    <span>Due Day {cm.dueDay}</span>
                    <span className="mx-1.5">·</span>
                    <span>{cm.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-sm font-bold text-white">
                      ₹{cm.amount.toLocaleString('en-IN')}
                    </div>
                    <div
                      className={`text-[10px] ${
                        cm.isPaid ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {cm.isPaid ? 'PAID' : 'LOCKED'}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleCommitmentPaid(cm.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      cm.isPaid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    }`}
                  >
                    {cm.isPaid ? 'Settled' : 'Pay Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Commitment Form */}
          <form onSubmit={handleCreateCommitment} className="pt-3 border-t border-slate-800 space-y-3">
            <div className="text-xs font-medium text-slate-300">
              + Lock New Monthly Commitment
            </div>
            <input
              type="text"
              placeholder="Commitment title (e.g., Exam Fee)"
              value={newBillTitle}
              onChange={e => setNewBillTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newBillAmount}
                onChange={e => setNewBillAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-400"
              />
              <input
                type="number"
                min={1}
                max={30}
                placeholder="Due Day (1-30)"
                value={newBillDay}
                onChange={e => setNewBillDay(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Locked Commitment</span>
            </button>
          </form>
        </div>

        {/* Column 2: Subscription Kill-Switch Manager (4 cols) */}
        <div className="lg:col-span-4 bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">
                Subscription Kill-Switch
              </h2>
            </div>
            <span className="text-xs font-mono text-indigo-300 tabular-nums">
              ₹{activeSubsMonthlyTotal}/MO ACTIVE
            </span>
          </div>

          {pausedSubsSavings > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-mono tabular-nums">
              You have paused ₹{pausedSubsSavings}/mo in subscriptions, boosting your daily allowance!
            </div>
          )}

          <div className="space-y-3">
            {subscriptions.map(sub => {
              const isLowValue = sub.usageScore < 50;
              return (
                <div
                  key={sub.id}
                  className={`p-3.5 bg-[#090D16] border rounded-lg space-y-2.5 ${
                    sub.status === 'paused'
                      ? 'border-slate-800/60 opacity-75'
                      : isLowValue
                      ? 'border-amber-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {sub.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono tabular-nums">
                        <span>Day {sub.billingDay}</span>
                        <span className="mx-1.5">·</span>
                        <span>Usage Score: {sub.usageScore}%</span>
                        {isLowValue && sub.status === 'active' && (
                          <>
                            <span className="mx-1.5">·</span>
                            <span className="text-amber-400">LOW USAGE DRAIN</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="text-sm font-bold text-white">
                        ₹{sub.amount}/mo
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sub.isSettledThisMonth
                          ? 'DEBITED'
                          : sub.status === 'active'
                          ? 'UPCOMING'
                          : 'PAUSED'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/70">
                    <span className="text-[11px] text-slate-400">
                      {sub.isSettledThisMonth
                        ? 'Already billed this cycle'
                        : sub.status === 'active'
                        ? `Pausing frees +₹${Math.round(sub.amount / metrics.remainingDays)}/day`
                        : `Paused — ₹${sub.amount} reclaimed`}
                    </span>

                    {!sub.isSettledThisMonth ? (
                      <button
                        onClick={() => onToggleSubscription(sub.id)}
                        className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          sub.status === 'active'
                            ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-500/30'
                        }`}
                      >
                        {sub.status === 'active' ? (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Pause Sub</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Resume</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Settled D{sub.billingDay}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Subscription Form */}
          <form onSubmit={handleCreateSub} className="pt-3 border-t border-slate-800 space-y-3">
            <div className="text-xs font-medium text-slate-300">
              + Track Another Subscription
            </div>
            <input
              type="text"
              placeholder="Service name (e.g., YouTube Premium)"
              value={newSubName}
              onChange={e => setNewSubName(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Monthly ₹"
                value={newSubAmount}
                onChange={e => setNewSubAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-400"
              />
              <input
                type="number"
                min={1}
                max={30}
                placeholder="Billing Day"
                value={newSubDay}
                onChange={e => setNewSubDay(e.target.value)}
                className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subscription</span>
            </button>
          </form>
        </div>

        {/* Column 3: Protected Savings Vaults & Emergency Buffer (4 cols) */}
        <div className="lg:col-span-4 bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                Savings Goals & Shock Buffer
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              ₹{metrics.savingsAllocated.toLocaleString('en-IN')} LOCKED
            </span>
          </div>

          {/* Emergency Buffer Shield */}
          <div className="p-4 bg-[#090D16] border border-sky-500/40 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-white">
                  Emergency Shock Buffer
                </span>
              </div>
              <span className="text-base font-mono font-bold text-sky-400 tabular-nums">
                ₹{emergencyBuffer.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dedicated shield for unexpected mid-month hardware, medical, or transit shocks so your daily allowance stays intact.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onUpdateEmergencyBuffer(200)}
                disabled={metrics.freeSpendablePool < 200}
                className="flex-1 py-1.5 px-2.5 bg-sky-500/15 hover:bg-sky-500/25 disabled:opacity-40 border border-sky-500/30 rounded-lg text-xs font-medium text-sky-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Lock +₹200</span>
              </button>
              <button
                onClick={() => onUpdateEmergencyBuffer(-200)}
                disabled={emergencyBuffer < 200}
                className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Release ₹200 to Cash</span>
              </button>
            </div>
          </div>

          {/* Individual Savings Goals */}
          <div className="space-y-3">
            {savingsGoals.map(goal => {
              const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  className="p-4 bg-[#090D16] border border-slate-800 rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {goal.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {goal.description}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 tabular-nums shrink-0">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-300">
                    <span>Saved: ₹{goal.savedAmount.toLocaleString('en-IN')}</span>
                    <span>Target: ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onUpdateSavingsGoal(goal.id, 250)}
                      disabled={metrics.freeSpendablePool < 250}
                      className="flex-1 py-1.5 px-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
                    >
                      + Deposit ₹250
                    </button>
                    <button
                      onClick={() => onUpdateSavingsGoal(goal.id, -250)}
                      disabled={goal.savedAmount < 250}
                      className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                    >
                      - Withdraw ₹250
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
