import React, { useState } from 'react';
import {
  FastForward,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  DailyProjectionPoint,
  FinancialMetrics,
  FixedCommitment,
  SubscriptionItem,
  Transaction,
  UnexpectedEvent,
} from '../types/finance';

interface TimelineViewProps {
  currentDay: number;
  metrics: FinancialMetrics;
  transactions: Transaction[];
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  unexpectedEvents: UnexpectedEvent[];
  onAdvanceDay: () => void;
  onJumpToDay: (day: number) => void;
  onTriggerShockEvent: (event: UnexpectedEvent) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  currentDay,
  metrics,
  transactions,
  commitments,
  subscriptions,
  unexpectedEvents,
  onAdvanceDay,
  onJumpToDay,
  onTriggerShockEvent,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  const inspectedProjection: DailyProjectionPoint | undefined =
    metrics.dailyProjections.find(p => p.day === selectedDay) ||
    metrics.dailyProjections[currentDay - 1];

  const dayTransactions = transactions.filter(t => t.day === selectedDay);
  const dayCommitments = commitments.filter(c => c.dueDay === selectedDay);
  const daySubscriptions = subscriptions.filter(s => s.billingDay === selectedDay);
  const dayEvents = unexpectedEvents.filter(e => e.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Header & Progression Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-[#131C2E] border border-slate-800 rounded-xl">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-400">
            30-DAY CYCLE PROGRESSION ENGINE · CURRENTLY DAY {currentDay} OF 30
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Interactive 30-Day Financial Runway & Event Calendar
          </h1>
          <p className="text-sm text-slate-300">
            Step forward day-by-day or click any day cell (D1–D30) to inspect settled expenses, scheduled commitment drops, subscription auto-debits, and unexpected life events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              const nextUnresolved = unexpectedEvents.find(e => !e.resolved);
              if (nextUnresolved) {
                onTriggerShockEvent(nextUnresolved);
              } else if (unexpectedEvents.length > 0) {
                onTriggerShockEvent(unexpectedEvents[0]);
              }
            }}
            className="px-4 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Life Shock Event</span>
          </button>

          <button
            onClick={() => {
              onAdvanceDay();
              setSelectedDay(Math.min(30, currentDay + 1));
            }}
            disabled={currentDay >= 30}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{currentDay >= 30 ? 'Cycle Complete (Day 30)' : `Advance to Day ${currentDay + 1}`}</span>
          </button>
        </div>
      </div>

      {/* Main Split: 30-Day Grid (8 cols) + Selected Day Inspector & Life Events Queue (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 30-Day Interactive Calendar Matrix */}
        <div className="lg:col-span-8 bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-semibold text-white">
                30-Day Cash Flow & Commitment Map
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>● Past/Settled</span>
              <span className="text-sky-400">● Today (D{currentDay})</span>
              <span className="text-amber-400">▲ Bill / Sub Due</span>
              <span className="text-rose-400">! Overdraft Zone</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
            {metrics.dailyProjections.map(pt => {
              const isPast = pt.day < currentDay;
              const isToday = pt.day === currentDay;
              const isSelected = pt.day === selectedDay;
              const hasCommitment = commitments.some(c => c.dueDay === pt.day);
              const hasSub = subscriptions.some(
                s => s.billingDay === pt.day && s.status === 'active'
              );
              const shockEvt = unexpectedEvents.find(e => e.day === pt.day);
              const isOverdraft = pt.actualOrProjectedBalance < 0;

              return (
                <button
                  key={pt.day}
                  onClick={() => setSelectedDay(pt.day)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[104px] cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-400/50'
                      : isToday
                      ? 'bg-[#19253E] border-sky-500/60'
                      : isOverdraft
                      ? 'bg-rose-950/25 border-rose-500/40 hover:border-rose-400'
                      : isPast
                      ? 'bg-[#090D16]/90 border-slate-800/80 hover:border-slate-700'
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        isToday
                          ? 'text-sky-400'
                          : isPast
                          ? 'text-slate-400'
                          : 'text-slate-200'
                      }`}
                    >
                      D{pt.day}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isToday ? 'TODAY' : isPast ? 'DONE' : 'PROJ'}
                    </span>
                  </div>

                  {/* Markers for Commitments, Subscriptions, or Shocks */}
                  <div className="my-1.5 space-y-0.5 text-[10px] font-mono truncate">
                    {hasCommitment && (
                      <div className="text-amber-400 truncate">▲ Fixed Bill</div>
                    )}
                    {hasSub && (
                      <div className="text-indigo-400 truncate">↻ Sub Debit</div>
                    )}
                    {shockEvt && (
                      <div
                        className={
                          shockEvt.severity === 'Positive'
                            ? 'text-emerald-400 truncate'
                            : 'text-rose-400 truncate'
                        }
                      >
                        ⚡ {shockEvt.severity === 'Positive' ? 'Gig' : 'Shock'}
                      </div>
                    )}
                    {!hasCommitment && !hasSub && !shockEvt && (
                      <div className="text-slate-600">-₹{pt.dailySpend} burn</div>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800/80 flex items-baseline justify-between w-full">
                    <span className="text-[10px] text-slate-500">Bal</span>
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums ${
                        isOverdraft
                          ? 'text-rose-400'
                          : pt.actualOrProjectedBalance < 1200
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      ₹{pt.actualOrProjectedBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Day Inspector + Life Events Queue */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Day Deep Inspector */}
          {inspectedProjection && (
            <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-mono text-sky-400">
                    DAY {selectedDay} SNAPSHOT
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedDay === currentDay
                      ? `Day ${selectedDay} (Current Active Day)`
                      : selectedDay < currentDay
                      ? `Day ${selectedDay} (Historical Log)`
                      : `Day ${selectedDay} (Projected Forecast)`}
                  </h3>
                </div>
                {selectedDay !== currentDay && (
                  <button
                    onClick={() => onJumpToDay(selectedDay)}
                    className="px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Set as Active Day
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg font-mono tabular-nums">
                <div>
                  <span className="text-[11px] font-sans text-slate-400 block">
                    End-of-Day Balance
                  </span>
                  <span
                    className={`text-base font-bold ${
                      inspectedProjection.actualOrProjectedBalance < 0
                        ? 'text-rose-400'
                        : 'text-white'
                    }`}
                  >
                    ₹{inspectedProjection.actualOrProjectedBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-sans text-slate-400 block">
                    Day Outflow / Burn
                  </span>
                  <span className="text-base font-bold text-amber-400">
                    -₹{inspectedProjection.dailySpend.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Scheduled or Logged Items on Selected Day */}
              <div className="space-y-2.5 text-xs">
                <div className="font-medium text-slate-400">
                  Activity & Scheduled Items on Day {selectedDay}:
                </div>

                {dayTransactions.length === 0 &&
                  dayCommitments.length === 0 &&
                  daySubscriptions.length === 0 &&
                  dayEvents.length === 0 && (
                    <div className="p-3 bg-[#090D16] border border-slate-800 rounded-lg text-slate-400">
                      {selectedDay > currentDay
                        ? `Projected baseline living spend of ₹${inspectedProjection.dailySpend} (food, transit, daily essentials).`
                        : 'No individual transactions recorded on this day.'}
                    </div>
                  )}

                {dayTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 bg-[#090D16] border border-slate-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{tx.title}</div>
                      <div className="text-[11px] text-slate-500">{tx.category}</div>
                    </div>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>
                ))}

                {dayCommitments.map(cm => (
                  <div
                    key={cm.id}
                    className="flex items-center justify-between p-2.5 bg-[#090D16] border border-amber-500/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-amber-300">
                        Commitment: {cm.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cm.isPaid ? 'Settled' : 'Upcoming Mandatory Bill'}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-amber-400 tabular-nums">
                      ₹{cm.amount}
                    </span>
                  </div>
                ))}

                {daySubscriptions.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 bg-[#090D16] border border-indigo-500/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-indigo-300">
                        Subscription: {sub.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Status: {sub.status.toUpperCase()}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-indigo-400 tabular-nums">
                      ₹{sub.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unexpected Life Events & Shock Simulator Panel */}
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Unexpected Life Events (30-Day Shocks)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {unexpectedEvents.filter(e => e.resolved).length}/{unexpectedEvents.length} RESOLVED
              </span>
            </div>

            <div className="space-y-3">
              {unexpectedEvents.map(evt => {
                const isPositive = evt.severity === 'Positive';
                return (
                  <div
                    key={evt.id}
                    className="p-3.5 bg-[#090D16] border border-slate-800 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                        DAY {evt.day} · {evt.category.toUpperCase()}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        {evt.resolved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">RESOLVED</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>PENDING</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {evt.title}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {evt.description}
                    </p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onTriggerShockEvent(evt)}
                        className="px-3 py-1.5 text-xs font-medium bg-[#131C2E] hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {isPositive ? (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>
                          {evt.resolved ? 'Review / Re-Simulate Decision' : 'Simulate & Resolve Now'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
