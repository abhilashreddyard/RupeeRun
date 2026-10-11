/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { PERSONA_PRESETS, WHAT_IF_TEMPLATES } from './data/presets';
import { NAVIGATION_TABS } from './constants/config';
import {
  FinancialProvider,
  useFinancialContext,
  ActiveTab,
} from './context/FinancialContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShockEventModal } from './components/ShockEventModal';

// Lazy-loaded view modules for optimal bundle splitting & performance
const CockpitView = lazy(() =>
  import('./components/CockpitView').then(m => ({ default: m.CockpitView }))
);
const WhatIfSandboxView = lazy(() =>
  import('./components/WhatIfSandboxView').then(m => ({ default: m.WhatIfSandboxView }))
);
const TimelineView = lazy(() =>
  import('./components/TimelineView').then(m => ({ default: m.TimelineView }))
);
const CommitmentsAndGoalsView = lazy(() =>
  import('./components/CommitmentsAndGoalsView').then(m => ({
    default: m.CommitmentsAndGoalsView,
  }))
);
const SmartLedgerView = lazy(() =>
  import('./components/SmartLedgerView').then(m => ({ default: m.SmartLedgerView }))
);

function ViewSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400"
    >
      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono">LOADING FINANCIAL MODULE...</span>
    </div>
  );
}

function RupeeRunWorkspace() {
  const {
    activeTab,
    setActiveTab,
    activePresetId,
    currentDay,
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
  } = useFinancialContext();

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => triggerToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage, triggerToast]);

  // Keyboard shortcuts (Alt + 1..5) for accessible fast view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        const target = NAVIGATION_TABS[idx];
        if (target) {
          setActiveTab(target.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      {/* Accessibility Skip Link */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-400 focus:text-slate-950 focus:font-semibold focus:rounded-lg"
      >
        Skip to main financial cockpit
      </a>

      {/* Strict 3-Zone Top Bar Contract */}
      <header
        role="banner"
        className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-4 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800"
      >
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
        <nav
          aria-label="Primary Workspace Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          {NAVIGATION_TABS.map(tab => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={e => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                  : ''
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('whatif')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 rounded-lg hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Simulate Decision
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <nav
        aria-label="Mobile Workspace Navigation"
        className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-[#0F172A] border-b border-slate-800 text-xs font-medium"
      >
        {NAVIGATION_TABS.map(item => (
          <button
            key={item.id}
            type="button"
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
      </nav>

      {/* Live Accessible Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 bg-[#131C2E] border border-sky-400/60 text-xs font-mono text-sky-200 rounded-xl shadow-xl"
        >
          {toastMessage}
        </div>
      )}

      {/* Main Content Container (1440px max-width desktop workspace) */}
      <main
        id="main-workspace"
        role="main"
        className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6"
      >
        <Suspense fallback={<ViewSkeleton />}>
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
              onUpdateEmergencyBuffer={handleUpdateEmergencyBuffer}
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
        </Suspense>
      </main>

      {/* Clean Quiet Footer */}
      <footer
        role="contentinfo"
        className="border-t border-slate-800/80 py-4 px-6 text-xs text-slate-400"
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            RupeeRun — 30-Day ₹10,000 Gen Z Personal Finance & Decision Simulation Cockpit
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleSelectPreset(PERSONA_PRESETS[0])}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Reset to Default Day 8 State
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleSelectPreset(PERSONA_PRESETS[2])}
              className="hover:text-slate-200 transition-colors cursor-pointer"
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

export default function App() {
  return (
    <ErrorBoundary>
      <FinancialProvider>
        <RupeeRunWorkspace />
      </FinancialProvider>
    </ErrorBoundary>
  );
}
