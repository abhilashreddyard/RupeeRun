import React from 'react';
import { AlertTriangle, Sparkles, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { ShockOption, UnexpectedEvent } from '../types/finance';

interface ShockEventModalProps {
  event: UnexpectedEvent | null;
  onResolve: (eventId: string, option: ShockOption) => void;
  onDismiss: () => void;
  liquidBalance: number;
  emergencyBuffer: number;
  safeDailyAllowance: number;
  remainingDays: number;
}

export const ShockEventModal: React.FC<ShockEventModalProps> = ({
  event,
  onResolve,
  onDismiss,
  liquidBalance,
  emergencyBuffer,
  safeDailyAllowance,
  remainingDays,
}) => {
  if (!event) return null;

  const isPositive = event.severity === 'Positive';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shock-modal-title"
    >
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#131C2E] border-b border-slate-800">
          <div className="flex items-center gap-3">
            {isPositive ? (
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="text-xs font-mono text-slate-400">
              <span>DAY {event.day} LIFE EVENT</span>
              <span className="mx-2">·</span>
              <span className={isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                {event.category.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <h2 id="shock-modal-title" className="text-xl font-bold text-white tracking-tight">
              {event.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Current Financial Context Strip */}
          <div className="grid grid-cols-3 gap-4 p-3.5 bg-[#090D16] border border-slate-800 rounded-lg text-xs">
            <div>
              <span className="text-slate-400 block">Liquid Cash Available</span>
              <span className="text-base font-mono font-semibold text-white tabular-nums">
                ₹{liquidBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Emergency Shock Buffer</span>
              <span className="text-base font-mono font-semibold text-sky-400 tabular-nums">
                ₹{emergencyBuffer.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Current Safe Daily Limit</span>
              <span className="text-base font-mono font-semibold text-emerald-400 tabular-nums">
                ₹{safeDailyAllowance.toLocaleString('en-IN')}/day
              </span>
            </div>
          </div>

          {/* Decision Options */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-slate-400">
              Choose how to handle this event — inspect the interconnected consequence before committing:
            </div>
            {event.options.map((opt) => {
              const dailyDelta =
                opt.incomeAdded
                  ? Math.round((opt.incomeAdded - Math.max(0, -opt.savingsImpact)) / Math.max(1, remainingDays))
                  : -Math.round(opt.cashImpact / Math.max(1, remainingDays));

              return (
                <div
                  key={opt.id}
                  className="p-4 bg-[#131C2E] border border-slate-800 hover:border-sky-500/60 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="font-semibold text-sm text-white">
                      {opt.label}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {opt.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono tabular-nums">
                      {opt.cashImpact > 0 && (
                        <span className="text-rose-400">
                          Cash: -₹{opt.cashImpact}
                        </span>
                      )}
                      {opt.savingsImpact > 0 && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-amber-400">
                            Buffer Used: -₹{opt.savingsImpact}
                          </span>
                        </>
                      )}
                      {opt.incomeAdded && opt.incomeAdded > 0 && (
                        <span className="text-emerald-400">
                          Inflow: +₹{opt.incomeAdded}
                        </span>
                      )}
                      <span className="text-slate-600">·</span>
                      <span className={dailyDelta >= 0 ? 'text-emerald-400' : 'text-amber-300'}>
                        Daily Allowance Impact: {dailyDelta >= 0 ? `+₹${dailyDelta}/day` : `${dailyDelta}/day`}
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-300/90 flex items-center gap-1.5 pt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{opt.healthNote}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onResolve(event.id, opt)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply Choice</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
