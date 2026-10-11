# RupeeRun — System Architecture & Engineering Specification

## 1. Architectural Overview

RupeeRun is architected as a modular, client-resilient financial simulation engine built with **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, **Recharts**, and **Motion**.

### Layered Separation of Concerns

1. **Domain & Type Layer (`src/types/finance.ts`)**:
   - Enforces strict compile-time contracts across all financial entities: `Transaction`, `FixedCommitment`, `SubscriptionItem`, `SavingsGoal`, `UnexpectedEvent`, `WhatIfDecision`, `DailyProjectionPoint`, and `FinancialMetrics`.
2. **Deterministic Calculation Engine (`src/utils/financialEngine.ts`)**:
   - Pure, side-effect-free function `calculateFinancialMetrics(state, whatIfDecision)` that computes all 30-day cash flow projections, locked obligation coverage, safe daily allowance, overdraft day detection, and the 5-factor weighted Financial Health Score.
   - Runs identically for both the **Baseline State** and the **Simulated What-If State**, guaranteeing zero mutation of actual ledger data during sandbox exploration.
3. **Persistence & Export Service Layer (`src/services/storageService.ts`)**:
   - Encapsulates `localStorage` serialization (`loadPersistedState`, `savePersistedState`) with defensive error recovery and RFC-4180 compliant CSV export (`exportLedgerToCSV`).
4. **State Hook & Context Layer (`src/hooks/useFinancialStore.ts` & `src/context/FinancialContext.tsx`)**:
   - `useFinancialStore` manages state transitions, persona preset loading, and storage synchronization.
   - `FinancialProvider` memoizes derived baseline and simulated metrics (`useMemo`) and exposes stable action handlers (`useCallback`) to prevent unnecessary component re-renders.
5. **Lazy-Loaded View & Visualization Layer (`src/components/*`)**:
   - Each primary workspace view (`CockpitView`, `WhatIfSandboxView`, `TimelineView`, `CommitmentsAndGoalsView`, `SmartLedgerView`) is dynamically code-split via `React.lazy` and `Suspense` inside `src/App.tsx`, wrapped by a fault-tolerant `ErrorBoundary`.

---

## 2. Data Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       USER INTERACTION LAYER                            │
│  • Advance Day (+1)   • What-If Sliders   • Pause Sub   • Shock Choice  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                FINANCIAL CONTEXT & STORE HOOK LAYER                     │
│  src/context/FinancialContext.tsx  +  src/hooks/useFinancialStore.ts    │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│   DETERMINISTIC FINANCIAL ENGINE      │ │    STORAGE & EXPORT SERVICE   │
│   src/utils/financialEngine.ts        │ │  src/services/storageService  │
│   • Baseline Metrics (useMemo)        │ │  • localStorage Sync          │
│   • Simulated What-If Metrics         │ │  • CSV Audit Trail Generator  │
│   • 30-Day Daily Trajectory Array     │ └───────────────────────────────┘
│   • 5-Factor Health & Risk Telemetry  │
└───────────────┬───────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               LAZY-LOADED VISUALIZATION & VIEW MODULES                  │
│  • CockpitView (+ Recharts SavingsGoalProgressRing & CopilotWidget)     │
│  • WhatIfSandboxView (Side-by-Side Delta Matrix + Dual SVG Curve)       │
│  • TimelineView (D1–D30 Interactive Matrix + ShockEventModal)           │
│  • CommitmentsAndGoalsView & SmartLedgerView                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Performance, Accessibility & Code Quality Engineering

- **Route-Level Code Splitting**: Heavy charting and secondary views are split into separate async chunks via `React.lazy()`, keeping the initial critical-path bundle lean and fast.
- **Memoized Reactive Pipeline**: Both baseline and simulated 30-day trajectories are memoized via `useMemo` and only recompute when underlying state slices change.
- **Zero-Layout-Shift Numerals**: All currency figures, percentages, and delta tables apply `font-variant-numeric: tabular-nums` (`JetBrains Mono`).
- **Accessibility Compliance**: Full semantic HTML5 landmarks (`header`, `nav`, `main`, `section`, `footer`), modal dialog roles (`role="dialog"`, `aria-modal="true"`), keyboard navigation shortcuts (`Alt + 1..5`), and non-hue-only status signaling.
