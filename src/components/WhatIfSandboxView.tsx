import React from 'react';
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';
import { FinancialMetrics, TransactionCategory, WhatIfDecision } from '../types/finance';
import { WHAT_IF_TEMPLATES } from '../data/presets';
import { TrajectoryChart } from './TrajectoryChart';

interface WhatIfSandboxViewProps {
  currentDay: number;
  baselineMetrics: FinancialMetrics;
  simulatedMetrics: FinancialMetrics;
  whatIfDecision: WhatIfDecision;
  onChangeDecision: (next: WhatIfDecision) => void;
  onCommitDecision: () => void;
  onResetDecision: () => void;
}

const CATEGORIES: TransactionCategory[] = [
  'Shopping & Essentials',
  'Food & Dining',
  'Social & Hangouts',
  'Transport & Metro',
  'Subscriptions',
  'Commitments & Bills',
  'Savings Transfer',
  'Extra Income',
];

export const WhatIfSandboxView: React.FC<WhatIfSandboxViewProps> = ({
  currentDay,
  baselineMetrics,
  simulatedMetrics,
  whatIfDecision,
  onChangeDecision,
  onCommitDecision,
  onResetDecision,
}) => {
  const deltaLiquid = simulatedMetrics.freeSpendablePool - baselineMetrics.freeSpendablePool;
  const deltaDaily = simulatedMetrics.safeDailyAllowance - baselineMetrics.safeDailyAllowance;
  const deltaEOM =
    simulatedMetrics.projectedEndOfMonthBalance - baselineMetrics.projectedEndOfMonthBalance;
  const deltaHealth =
    simulatedMetrics.financialHealthScore - baselineMetrics.financialHealthScore;
  const deltaSavings = simulatedMetrics.savingsAllocated - baselineMetrics.savingsAllocated;

  const formatDelta = (val: number, suffix = '', isCurrency = true) => {
    if (val === 0) return 'No change';
    const sign = val > 0 ? '+' : '-';
    const abs = Math.abs(val).toLocaleString('en-IN');
    return `${sign}${isCurrency ? '₹' : ''}${abs}${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-[#131C2E] border border-slate-800 rounded-xl">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-400">
            PRE-DECISION IMPACT SIMULATOR · DAY {currentDay} OF 30
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Live "What-If" Financial Decision Sandbox
          </h1>
          <p className="text-sm text-slate-300">
            Test any impulse purchase, daily habit, subscription change, or side-gig inflow before you act. Inspect how it shifts your daily safe-to-spend limit, 30-day runway curve, and bankruptcy risk.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onResetDecision}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#090D16] border border-slate-700 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario</span>
          </button>
          <button
            onClick={onCommitDecision}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Commit Decision to Ledger</span>
          </button>
        </div>
      </div>

      {/* Curated Gen Z Dilemma Templates */}
      <div className="space-y-2.5">
        <div className="text-xs font-medium text-slate-400">
          Quick-Load Gen Z Financial Dilemmas (Click to simulate immediately):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WHAT_IF_TEMPLATES.map(tpl => {
            const isSelected =
              whatIfDecision.title === tpl.decision.title &&
              whatIfDecision.amount === tpl.decision.amount;
            return (
              <button
                key={tpl.id}
                onClick={() =>
                  onChangeDecision({
                    ...tpl.decision,
                    triggerDay: Math.max(currentDay, tpl.decision.triggerDay),
                  })
                }
                className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400 text-white'
                    : 'bg-[#131C2E] border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="font-semibold text-sm text-white">{tpl.label}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                  {tpl.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Zone Simulation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Zone: Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 bg-[#131C2E] border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h2 className="text-base font-semibold text-white">
                  Scenario Parameters
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">LIVE RECALCULATION</span>
            </div>

            {/* Decision Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Decision Title
              </label>
              <input
                type="text"
                value={whatIfDecision.title}
                onChange={e =>
                  onChangeDecision({ ...whatIfDecision, title: e.target.value })
                }
                placeholder="e.g., Buy Mechanical Keyboard"
                className="w-full px-3.5 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Decision Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Decision Mechanism
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'one_time_expense', label: 'One-Time Spend' },
                  { id: 'recurring_daily', label: 'Daily Habit (/day)' },
                  { id: 'new_subscription', label: 'New Subscription' },
                  { id: 'pause_subscriptions', label: 'Pause Subscriptions' },
                  { id: 'savings_boost', label: 'Lock in Savings' },
                  { id: 'extra_income', label: 'Side-Gig Income' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onChangeDecision({
                        ...whatIfDecision,
                        type: item.id as WhatIfDecision['type'],
                      })
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap truncate cursor-pointer ${
                      whatIfDecision.type === item.id
                        ? 'bg-sky-500/15 border-sky-400 text-sky-300'
                        : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Slider + Direct Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">
                  {whatIfDecision.type === 'recurring_daily'
                    ? 'Daily Recurring Cost (₹/day)'
                    : 'Rupee Amount (₹)'}
                </label>
                <span className="font-mono font-bold text-base text-sky-400 tabular-nums">
                  ₹{whatIfDecision.amount.toLocaleString('en-IN')}
                  {whatIfDecision.type === 'recurring_daily' ? '/day' : ''}
                </span>
              </div>
              <input
                type="range"
                min={whatIfDecision.type === 'recurring_daily' ? 20 : 50}
                max={whatIfDecision.type === 'recurring_daily' ? 500 : 5000}
                step={whatIfDecision.type === 'recurring_daily' ? 10 : 50}
                value={whatIfDecision.amount}
                onChange={e =>
                  onChangeDecision({
                    ...whatIfDecision,
                    amount: Number(e.target.value),
                  })
                }
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                <span>{whatIfDecision.type === 'recurring_daily' ? '₹20/day' : '₹50'}</span>
                <span>{whatIfDecision.type === 'recurring_daily' ? '₹250/day' : '₹2,500'}</span>
                <span>{whatIfDecision.type === 'recurring_daily' ? '₹500/day' : '₹5,000'}</span>
              </div>
            </div>

            {/* Trigger Day Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">
                  Execution Day in 30-Day Cycle
                </label>
                <span className="font-mono font-semibold text-white tabular-nums">
                  Day {Math.max(currentDay, whatIfDecision.triggerDay)} of 30
                </span>
              </div>
              <input
                type="range"
                min={currentDay}
                max={30}
                step={1}
                value={Math.max(currentDay, whatIfDecision.triggerDay)}
                onChange={e =>
                  onChangeDecision({
                    ...whatIfDecision,
                    triggerDay: Number(e.target.value),
                  })
                }
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                <span>Today (Day {currentDay})</span>
                <span>Day 30 (Month End)</span>
              </div>
            </div>

            {/* Category & Essential Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={whatIfDecision.category}
                  onChange={e =>
                    onChangeDecision({
                      ...whatIfDecision,
                      category: e.target.value as TransactionCategory,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-400"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Spend Priority
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChangeDecision({
                      ...whatIfDecision,
                      isEssential: !whatIfDecision.isEssential,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#090D16] border border-slate-700 rounded-lg text-xs font-medium text-slate-200 hover:border-slate-500 transition-colors cursor-pointer"
                >
                  {whatIfDecision.isEssential ? 'Essential Need' : 'Discretionary Want'}
                </button>
              </div>
            </div>
          </div>

          {/* Verdict Banner inside Left Box */}
          <div className="p-4 bg-[#090D16] border border-slate-800 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              {simulatedMetrics.projectedZeroCashDay !== null ? (
                <>
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-400 font-semibold">
                    SIMULATION VERDICT: HIGH OVERDRAFT RISK (DAY {simulatedMetrics.projectedZeroCashDay})
                  </span>
                </>
              ) : deltaHealth >= 0 ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-semibold">
                    SIMULATION VERDICT: RUNWAY & HEALTH STRENGTHENED
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-400 font-semibold">
                    SIMULATION VERDICT: MANAGEABLE WITH DAILY ALLOWANCE COMPRESSION
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {simulatedMetrics.projectedZeroCashDay !== null
                ? `Executing "${whatIfDecision.title}" pushes your trajectory below ₹0 on Day ${simulatedMetrics.projectedZeroCashDay}. Delay this expense or pause subscriptions first.`
                : `Your daily safe-to-spend shifts from ₹${baselineMetrics.safeDailyAllowance}/day to ₹${simulatedMetrics.safeDailyAllowance}/day across the remaining ${baselineMetrics.remainingDays} days.`}
            </p>
          </div>
        </div>

        {/* Right Zone: Side-by-Side Before/After Matrix + Dual Trajectory Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Side-by-Side Comparison Matrix */}
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Side-by-Side Impact Comparison (Before vs. After Decision)
              </h2>
              <span className="text-xs font-mono text-slate-400">
                6 INTERCONNECTED METRICS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <th className="py-2.5 pr-4">FINANCIAL DIMENSION</th>
                    <th className="py-2.5 px-4 text-right">CURRENT BASELINE</th>
                    <th className="py-2.5 px-4 text-right text-sky-400">AFTER SIMULATION</th>
                    <th className="py-2.5 pl-4 text-right">NET CONSEQUENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-sm font-mono tabular-nums">
                  <tr>
                    <td className="py-3 pr-4 font-sans text-slate-200 font-medium">
                      Free Spendable Cash Pool
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      ₹{baselineMetrics.freeSpendablePool.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      ₹{simulatedMetrics.freeSpendablePool.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 pl-4 text-right font-semibold ${
                        deltaLiquid > 0
                          ? 'text-emerald-400'
                          : deltaLiquid < 0
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatDelta(deltaLiquid)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-4 font-sans text-slate-200 font-medium">
                      Safe-to-Spend Daily Allowance
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      ₹{baselineMetrics.safeDailyAllowance}/day
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      ₹{simulatedMetrics.safeDailyAllowance}/day
                    </td>
                    <td
                      className={`py-3 pl-4 text-right font-semibold ${
                        deltaDaily > 0
                          ? 'text-emerald-400'
                          : deltaDaily < 0
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatDelta(deltaDaily, '/day')}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-4 font-sans text-slate-200 font-medium">
                      Day 30 Projected EOM Balance
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      ₹{baselineMetrics.projectedEndOfMonthBalance.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        simulatedMetrics.projectedEndOfMonthBalance < 0
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      ₹{simulatedMetrics.projectedEndOfMonthBalance.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 pl-4 text-right font-semibold ${
                        deltaEOM > 0
                          ? 'text-emerald-400'
                          : deltaEOM < 0
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatDelta(deltaEOM)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-4 font-sans text-slate-200 font-medium">
                      Protected Savings & Buffer
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      ₹{baselineMetrics.savingsAllocated.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      ₹{simulatedMetrics.savingsAllocated.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 pl-4 text-right font-semibold ${
                        deltaSavings > 0
                          ? 'text-emerald-400'
                          : deltaSavings < 0
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatDelta(deltaSavings)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-4 font-sans text-slate-200 font-medium">
                      Financial Health Score (0–100)
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {baselineMetrics.financialHealthScore} / 100
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      {simulatedMetrics.financialHealthScore} / 100
                    </td>
                    <td
                      className={`py-3 pl-4 text-right font-semibold ${
                        deltaHealth > 0
                          ? 'text-emerald-400'
                          : deltaHealth < 0
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatDelta(deltaHealth, ' pts', false)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 pr-4 font-sans text-slate-200 font-medium">
                      Financial Risk Classification
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-300">
                      {baselineMetrics.riskLevel}
                    </td>
                    <td
                      className={`py-3 px-4 text-right text-xs font-semibold ${
                        simulatedMetrics.riskLevel === 'LOW RISK'
                          ? 'text-emerald-400'
                          : simulatedMetrics.riskLevel === 'MODERATE RISK'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simulatedMetrics.riskLevel}
                    </td>
                    <td className="py-3 pl-4 text-right text-xs text-slate-400">
                      {simulatedMetrics.projectedZeroCashDay
                        ? `Broke on Day ${simulatedMetrics.projectedZeroCashDay}`
                        : 'Survives 30 Days'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dual Trajectory Chart */}
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  30-Day Dual-Trajectory Forecast Curve
                </h3>
                <p className="text-xs text-slate-400">
                  Comparing current baseline trajectory (dashed slate) against simulated decision curve (solid electric blue)
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400">━ Actual</span>
                <span className="text-slate-400">┅ Baseline Forecast</span>
                <span className="text-sky-400">━ Simulated What-If</span>
              </div>
            </div>

            <TrajectoryChart
              baselineProjections={baselineMetrics.dailyProjections}
              simulatedProjections={simulatedMetrics.dailyProjections}
              currentDay={currentDay}
              height={220}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
