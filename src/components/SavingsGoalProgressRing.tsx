import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Plus, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { SavingsGoal } from '../types/finance';

interface SavingsGoalProgressRingProps {
  savingsGoals: SavingsGoal[];
  emergencyBuffer: number;
  freeSpendablePool: number;
  safeDailyAllowance: number;
  remainingDays: number;
  onContributeToGoal: (goalId: string, amount: number) => void;
  onNavigateToGoals: () => void;
}

export const SavingsGoalProgressRing: React.FC<SavingsGoalProgressRingProps> = ({
  savingsGoals,
  emergencyBuffer,
  freeSpendablePool,
  safeDailyAllowance,
  remainingDays,
  onContributeToGoal,
  onNavigateToGoals,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('ALL');
  const [showCelebration, setShowCelebration] = useState(false);

  const selectedGoal =
    selectedGoalId === 'ALL'
      ? null
      : savingsGoals.find(g => g.id === selectedGoalId) || null;

  const totalSavedGoals = savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTargetGoals = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const activeSaved = selectedGoal ? selectedGoal.savedAmount : totalSavedGoals;
  const activeTarget = selectedGoal
    ? selectedGoal.targetAmount
    : Math.max(1, totalTargetGoals);

  const rawPercentage = Math.round((activeSaved / Math.max(1, activeTarget)) * 100);
  const clampedPercentage = Math.min(100, Math.max(0, rawPercentage));
  const remainingToGoal = Math.max(0, activeTarget - activeSaved);
  const isCompleted = activeSaved >= activeTarget && activeTarget > 0;

  useEffect(() => {
    if (isCompleted) {
      setShowCelebration(true);
    } else {
      setShowCelebration(false);
    }
  }, [isCompleted, selectedGoalId]);

  const chartData = [
    {
      name: 'Saved Toward Goal',
      value: Math.min(activeSaved, activeTarget),
      color: isCompleted ? '#10B981' : '#38BDF8',
    },
    {
      name: 'Remaining to Target',
      value: Math.max(0, activeTarget - activeSaved),
      color: '#1E293B',
    },
  ];

  const primaryGoalId = selectedGoal
    ? selectedGoal.id
    : savingsGoals[0]?.id || '';

  const dailyImpactOf250 = Math.round(250 / Math.max(1, remainingDays));

  return (
    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden">
      {/* Header & Goal Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            30-Day Savings Goal Progress Ring
          </h3>
          <p className="text-xs text-slate-400">
            Recharts radial tracker · Emergency Shield: ₹{emergencyBuffer.toLocaleString('en-IN')}
          </p>
        </div>

        <select
          value={selectedGoalId}
          onChange={e => setSelectedGoalId(e.target.value)}
          aria-label="Select savings goal to inspect"
          className="px-2.5 py-1.5 bg-[#090D16] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-400"
        >
          <option value="ALL">All 30-Day Goals (₹{totalTargetGoals.toLocaleString('en-IN')})</option>
          {savingsGoals.map(g => (
            <option key={g.id} value={g.id}>
              {g.name.split(' ')[0]} Goal (₹{g.savedAmount}/₹{g.targetAmount})
            </option>
          ))}
        </select>
      </div>

      {/* Main Split: Recharts Progress Ring + Telemetry & Completion Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Recharts Radial Ring Container */}
        <div className="sm:col-span-5 relative h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={74}
                startAngle={90}
                endAngle={-270}
                paddingAngle={remainingToGoal > 0 && activeSaved > 0 ? 3 : 0}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                animationDuration={750}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#090D16',
                  borderColor: '#1E293B',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
                itemStyle={{ color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Overlay with Completion Animation */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="completed-badge"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="flex flex-col items-center text-center"
                >
                  <Award className="w-6 h-6 text-emerald-400 mb-0.5" />
                  <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                    {rawPercentage}%
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300">
                    GOAL MET
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="progress-counter"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-2xl font-mono font-bold text-white tabular-nums">
                    {clampedPercentage}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    OF TARGET
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Metrics, Completion Celebration Banner & Quick Boost Controls */}
        <div className="sm:col-span-7 space-y-3">
          <div className="p-3 bg-[#090D16] border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {selectedGoal ? selectedGoal.name : 'Combined 30-Day Goals'}
              </span>
              <span className="font-mono font-semibold text-white tabular-nums">
                ₹{activeSaved.toLocaleString('en-IN')} / ₹{activeTarget.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-400 font-sans">Remaining to 100%:</span>
              <span className={isCompleted ? 'text-emerald-400 font-semibold' : 'text-sky-400'}>
                {isCompleted ? 'Target Reached!' : `₹${remainingToGoal.toLocaleString('en-IN')} needed`}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 tabular-nums pt-1 border-t border-slate-800/80">
              {isCompleted
                ? '100% locked! Your 30-day savings milestone is fully funded.'
                : `Locking ₹250 today adjusts Safe Daily Allowance by -₹${dailyImpactOf250}/day (to ₹${Math.max(0, safeDailyAllowance - dailyImpactOf250)}/day).`}
            </div>
          </div>

          {/* Animated Completion Celebration Banner */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-lg flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Milestone Unlocked!</strong> 30-Day target achieved ahead of schedule.
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Contribution Buttons */}
          {primaryGoalId && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onContributeToGoal(primaryGoalId, 250)}
                disabled={freeSpendablePool < 250}
                className="px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 disabled:opacity-40 border border-sky-500/30 rounded-lg text-xs font-medium text-sky-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Boost +₹250</span>
              </button>

              {!isCompleted && remainingToGoal > 0 && (
                <button
                  type="button"
                  onClick={() => onContributeToGoal(primaryGoalId, remainingToGoal)}
                  disabled={freeSpendablePool < remainingToGoal}
                  title={
                    freeSpendablePool < remainingToGoal
                      ? 'Insufficient free spendable cash to complete all at once'
                      : 'Complete remaining goal amount immediately'
                  }
                  className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Goal (+₹{remainingToGoal.toLocaleString('en-IN')})</span>
                </button>
              )}

              <button
                type="button"
                onClick={onNavigateToGoals}
                className="ml-auto text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>All Vaults</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
