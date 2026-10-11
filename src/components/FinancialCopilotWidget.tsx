import React, { useState, useMemo } from 'react';
import {
  Flame,
  ShieldCheck,
  Sparkles,
  Compass,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { FinancialMetrics, SubscriptionItem } from '../types/finance';
import { SURVIVAL_CHALLENGES } from '../constants/config';
import { evaluateRunwayStressTests } from '../services/analyticsService';

interface FinancialCopilotWidgetProps {
  currentDay: number;
  metrics: FinancialMetrics;
  subscriptions: SubscriptionItem[];
  onPauseLowestValueSub: (subId: string) => void;
  onLockEmergencyShield: () => void;
}

export const FinancialCopilotWidget: React.FC<FinancialCopilotWidgetProps> = React.memo(({
  currentDay,
  metrics,
  subscriptions,
  onPauseLowestValueSub,
  onLockEmergencyShield,
}) => {
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);

  const stressTests = useMemo(
    () => evaluateRunwayStressTests(metrics, subscriptions),
    [metrics, subscriptions]
  );

  // Compute Gen Z Financial Archetype based on live metrics
  const getFinancialPersona = () => {
    if (metrics.financialHealthScore >= 82 && metrics.savingsAllocated >= 1800) {
      return {
        badge: 'COMPOUND ARCHITECT',
        tagline: 'High savings resilience with disciplined daily burn control.',
        accent: 'text-emerald-400',
      };
    }
    if (metrics.upcomingSubscriptionsTotal >= 600) {
      return {
        badge: 'SUBSCRIPTION COLLECTOR',
        tagline: 'Recurring auto-debits are compressing your daily cash freedom.',
        accent: 'text-indigo-400',
      };
    }
    if (metrics.currentDailyBurnAvg > metrics.safeDailyAllowance) {
      return {
        badge: 'IMPULSE SPRINTER',
        tagline: 'Early-cycle burn velocity exceeds your remaining safe daily runway.',
        accent: 'text-amber-400',
      };
    }
    return {
      badge: 'BALANCED NAVIGATOR',
      tagline: 'Steady 30-day runway pacing with active commitment coverage.',
      accent: 'text-sky-400',
    };
  };

  const persona = getFinancialPersona();

  const lowestUsageActiveSub = subscriptions
    .filter(s => s.status === 'active' && !s.isSettledThisMonth)
    .sort((a, b) => a.usageScore - b.usageScore)[0];

  const toggleChallengeComplete = (id: string) => {
    setCompletedChallengeIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <section
      aria-label="Behavioral Financial Copilot, Stress-Test Simulator, and Survival Challenges"
      className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>BEHAVIORAL FINTECH COPILOT · DAY {currentDay} ARCHETYPE</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Active Archetype:{' '}
              <span className={`font-mono ${persona.accent}`}>{persona.badge}</span>
            </h2>
            <span className="text-xs text-slate-400">— {persona.tagline}</span>
          </div>
        </div>

        {/* 1-Click Auto-Optimization Action */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {lowestUsageActiveSub && (
            <button
              type="button"
              onClick={() => onPauseLowestValueSub(lowestUsageActiveSub.id)}
              className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Auto-Optimize: Pause {lowestUsageActiveSub.name.split(' ')[0]} (+₹
                {lowestUsageActiveSub.amount})
              </span>
            </button>
          )}

          {metrics.emergencyBuffer < 1000 && metrics.freeSpendablePool >= 200 && (
            <button
              type="button"
              onClick={onLockEmergencyShield}
              className="px-3.5 py-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-lg text-xs font-medium text-sky-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Fortify Shock Shield (+₹200)</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Shock Runway Stress-Test Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Activity className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span>30-Day Emergency Shock Stress-Test Matrix</span>
          </div>
          <span className="font-mono text-slate-400 tabular-nums">
            BUFFER SHIELD: ₹{metrics.emergencyBuffer.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stressTests.map(test => (
            <div
              key={test.id}
              className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-slate-300 font-semibold">{test.title}</span>
                <span
                  className={
                    test.survivesMonth ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                  }
                >
                  {test.survivalProbability}% SURVIVAL
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
                <span>Post-Shock Daily: ₹{test.postShockDailyAllowance}/day</span>
                <span>·</span>
                <span
                  className={
                    test.postShockEOMBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  EOM: ₹{test.postShockEOMBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {test.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Interactive 30-Day Survival Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SURVIVAL_CHALLENGES.map(chal => {
          const isDone =
            completedChallengeIds.includes(chal.id) ||
            (chal.id === 'chal-shock-shield' && metrics.emergencyBuffer >= 1000) ||
            (chal.id === 'chal-sub-audit' &&
              subscriptions.some(s => s.status === 'paused'));

          return (
            <div
              key={chal.id}
              className={`p-4 rounded-lg border transition-colors flex flex-col justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-[#090D16] border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isDone ? 'text-emerald-400' : 'text-amber-400'}>
                    <Flame className="w-3.5 h-3.5 inline mr-1 -mt-0.5" aria-hidden="true" />
                    {chal.targetMetric}
                  </span>
                  <span className="text-slate-400">
                    {isDone ? 'ACTIVE BONUS' : 'SPRINT GOAL'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{chal.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {chal.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-sky-300 tabular-nums">
                  {chal.rewardAllowanceBoost}
                </span>
                <button
                  type="button"
                  onClick={() => toggleChallengeComplete(chal.id)}
                  aria-pressed={isDone}
                  aria-label={`Mark ${chal.title} as complete`}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  <span>{isDone ? 'Completed' : 'Pledge Sprint'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
FinancialCopilotWidget.displayName = 'FinancialCopilotWidget';
