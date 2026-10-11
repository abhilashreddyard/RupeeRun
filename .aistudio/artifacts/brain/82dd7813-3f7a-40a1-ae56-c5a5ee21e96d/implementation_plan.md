# RupeeRun — 30-Day ₹10,000 Gen Z Financial Cockpit & Decision Simulator

RupeeRun is an interactive consumer fintech application and financial simulation engine designed for Gen Z users managing a strict ₹10,000 budget over a 30-day cycle. It goes beyond passive expense tracking by modeling the real-time ripple effects between daily spending, fixed commitments, recurring subscriptions, savings goals, unexpected life events, and a live "What-If" decision sandbox.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product decisions incorporate your confirmed preferences from our design alignment:

- **Confirmed Decision 1 (Visual Aesthetic)**: **Clean Dark Fintech Cockpit with High-Contrast Metrics** — Built on a deep slate canvas (`#090D16` / `#0F172A`) with crisp 1px structural borders (`#1E293B`), high-contrast tabular numerals (`JetBrains Mono`), and semantic status indicators (Emerald for healthy runway, Amber for burn-rate tension, Coral Red for overdraft/commitment risk).
- **Confirmed Decision 2 (30-Day Cycle & Unexpected Events)**: **Interactive 30-Day Timeline with Day-by-Day Progression & Life Events** — Users can step day-by-day (`Advance Day`), jump across the 30-day timeline, or run auto-progression. Scheduled commitments (e.g., PG Rent/Hostel Mess share, Phone Recharge, OTT Subscriptions) auto-settle on their billing days, while realistic Gen Z unexpected life events (e.g., laptop charger failure, sudden friend birthday split, late-night clinic visit, internship stipend bonus) trigger interactive multi-option resolution modals with transparent trade-offs.
- **Confirmed Decision 3 (Decision Simulation)**: **Live What-If Sandbox with Side-by-Side Before/After Impact Comparison** — Before committing to any purchase, subscription change, or emergency payout, users can test the decision in the live simulator and inspect an instant side-by-side comparison of **Current Trajectory vs. Simulated Trajectory** across Remaining Balance, Safe-to-Spend Daily Allowance, Savings Goal Completion, 30-Day EOM Forecast, Financial Risk Level, and Overall Financial Health Score.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms a ₹10,000 monthly allowance/stipend into a dynamic financial cockpit where every rupee is accounted for across four buckets: **Liquid Spendable Cash**, **Locked Commitments & Subscriptions**, **Protected Savings Vaults**, and **Emergency Buffer**.
- **Target Audience / Persona**: Gen Z college students, interns, and early-career young adults in India navigating tight monthly budgets (₹10,000/month), frequent UPI micro-transactions, shared group splits, digital subscriptions, and competing short-term savings goals.
- **Key Value**: Eliminates "end-of-month broke syndrome" by showing users *before* they spend how a ₹450 cafe outing or ₹649 subscription renewal compresses their daily safe-to-spend allowance for the remaining days of the month and shifts their bankruptcy risk date.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **30-Day Cockpit & Daily Progression Flow**:
   - Users start on Day 8 of a realistic, populated 30-day cycle (or can reset to Day 1 / load custom Gen Z persona presets like *College Hostel Resident*, *Metro Commuter Intern*, or *Freelance Creator*).
   - Clicking **Advance Day (+1 Day)** processes that day's scheduled subscriptions/commitments, logs daily baseline living expenses, recalculates the **Safe-to-Spend Daily Allowance**, and dynamically triggers contextual **Unexpected Life Events** on milestone days (or on-demand via the Event Simulator).
2. **Live "What-If" Decision Sandbox Flow**:
   - Users enter a proposed decision (e.g., *"Buy Concert Pass — ₹1,500"*, *"Upgrade Gym Membership — ₹800/mo"*, *"Pause Spotify & Netflix — Save ₹318"*, or custom amount/category/day) or pick from curated Gen Z dilemma templates.
   - The sandbox immediately renders a **Side-by-Side Before vs. After Impact Matrix** and a **Dual-Curve 30-Day Balance Projection Chart** (Baseline Trajectory vs. Simulated Trajectory).
   - Users can click **Commit Decision to Ledger** to execute the choice or **Discard Scenario** to protect their runway.
3. **Commitments, Subscriptions & Savings Rebalancing Flow**:
   - Users manage fixed commitments (Hostel/Mess Fee, Metro Pass, Wi-Fi Share) and recurring subscriptions (Spotify Duo, Netflix Mobile, Cloud Storage, Zomato Gold, Gym).
   - Toggling a subscription between *Active* and *Paused/Cancelled* immediately frees up locked funds and recalculates the daily allowance and end-of-month surplus.
   - Users allocate money into **Savings Goals** (e.g., *Goa Trip Fund*, *Emergency Tech Repair Buffer*, *Course Certification*) with auto-save daily rules or instant transfers between Emergency Buffer and Spendable Cash.
4. **Unexpected Expense Resolution Flow**:
   - When an unexpected event strikes (e.g., *"Phone Screen Crack — ₹1,400"* or *"Group Dinner Split — ₹650"*), the user is presented with 3 distinct financial responses:
     1. *Pay from Liquid Spendable Cash* (reduces daily allowance for remaining days),
     2. *Tap Protected Savings / Emergency Buffer* (preserves daily allowance but delays goal completion), or
     3. *Negotiate / Defer / Low-Cost Alternative* (reduces immediate cash hit with specific trade-offs).

### Visual Identity & Theme
- **Aesthetic Direction**: High-precision dark fintech cockpit inspired by modern consumer neo-banks and institutional analytics terminals.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - **60% Dominant Canvas**: Deep obsidian slate (`#090D16`) and primary workspace surface (`#0F172A`).
  - **30% Structural Surfaces**: Elevated panel slate (`#131C2E`) with crisp 1px borders (`#1E293B`), subtle row hover states, and muted slate metadata (`#94A3B8`).
  - **10% Semantic Focal Accents**:
    - Nominal / Healthy Runway: Emerald (`#10B981`) paired with explicit text labels (`NOMINAL`, `SAFE`).
    - Caution / Compression: Amber (`#F59E0B`) paired with explicit text labels (`TIGHTENING`, `MODERATE RISK`).
    - Critical / Overdraft Risk: Coral Crimson (`#EF4444`) paired with explicit text labels (`CRITICAL`, `HIGH RISK`).
    - Interactive Simulation Accent: Electric Cyan/Indigo (`#38BDF8` / `#6366F1`) for "What-If" scenario trajectories.
- **Typography & Hierarchy**:
  - **Display & Headings**: `Plus Jakarta Sans` (SemiBold/Bold, tight tracking, balanced headline wrapping).
  - **Body & Controls**: `DM Sans` for crisp scannability at 13px–15px.
  - **Financial Metrics & Telemetry**: `JetBrains Mono` with strict `tabular-nums` (`font-variant-numeric: tabular-nums`) on every rupee figure, percentage, day counter, and delta table so numbers align vertically without layout jitter.
- **Component Styling & Layout**:
  - Follows the **Top Bar 3-Zone Contract**: Single-line brand wordmark (`RupeeRun`) on the left, 5 concise single-line navigation links (`Cockpit`, `What-If Lab`, `30-Day Timeline`, `Commitments & Goals`, `Ledger`) in the center, and 1 primary action button (`+ Simulate Decision`) on the right.
  - Zero static pill badges on metadata; all transaction tags, dates, and category metadata use clean unboxed typography with `·` separators.
  - Full 1440px desktop presence with single-elevation border hierarchy (`border border-slate-800`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Interconnected Financial Engine vs. Isolated Calculators**
  - *Chosen Approach*: Single unified reactive state engine where every rupee is linked across 7 live formulas (Total Balance, Locked Commitments, Active Subscriptions, Protected Savings, Safe-to-Spend Daily Allowance, 30-Day EOM Forecast, and Composite Financial Health & Risk Score).
  - *Why*: The problem statement explicitly requires that financial decisions have *visible and interconnected consequences*. Changing a ₹199 subscription or logging a ₹350 meal immediately updates all 7 metrics and re-plots the 30-day projection curve.
- **Decision 2: Deterministic + Explainable Financial Health & Risk Scoring**
  - *Chosen Approach*: A transparent 0–100 **Financial Health Score** and **Risk Index** broken down into 5 visible sub-factors: *Burn Rate Velocity (25%)*, *Commitment Coverage Ratio (25%)*, *Savings & Buffer Resilience (20%)*, *Subscription Load (15%)*, and *Runway Survival Days (15%)*.
  - *Why*: Users shouldn't see a "black box" number. Every point gained or lost in the Health Score is explained with a concrete mathematical breakdown and actionable recommendation.
- **Decision 3: Zero-Friction Local Persistence + Instant Scenario Presets**
  - *Chosen Approach*: Instant client-side state persistence (`localStorage`) combined with 1-click **Persona Scenario Switchers** (*"Balanced Student — Day 8"*, *"Mid-Month Crunch — Day 18"*, *"Subscription Heavy — Day 12"*, *"Fresh Month — Day 1"*) and CSV/JSON export.
  - *Why*: Ensures evaluators and users can immediately explore rich mid-month data, test edge cases (like impending overdrafts), or reset cleanly without login walls.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         TOP BAR (3-Zone Contract)                                │
│  [RupeeRun]     [Cockpit · What-If Lab · Timeline · Commitments · Ledger]  [CTA] │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼──────────────────────────────────────────┐
│                   UNIFIED FINANCIAL ENGINE (React Context / Store)               │
│  • Base Budget (₹10,000 + Extra Income)    • 30-Day Daily Projection Array       │
│  • Transactions & Daily Burn Calculator    • Safe-to-Spend Allowance Formula     │
│  • Fixed Commitments & Subscriptions       • Multi-Factor Risk & Health Engine   │
│  • Savings Goals & Emergency Buffer        • Unexpected Life Event Queue         │
└───────┬───────────────────┬────────────────────┬───────────────────┬─────────────┘
        │                   │                    │                   │
┌───────▼────────┐ ┌────────▼─────────┐ ┌────────▼────────┐ ┌────────▼─────────┐
│ 1. COCKPIT     │ │ 2. WHAT-IF LAB   │ │ 3. 30-DAY       │ │ 4. COMMITMENTS,  │
│ OVERVIEW       │ │ (SIMULATOR)      │ │ TIMELINE &      │ │ SUBSCRIPTIONS &  │
│ • 6 Interlinked│ │ • Scenario Input │ │ SHOCK EVENTS    │ │ SAVINGS VAULTS   │
│   KPI Strip    │ │   & Templates    │ │ • Day 1..30     │ │ • Fixed Bills    │
│ • 30-Day Burn  │ │ • Side-by-Side   │ │   Interactive   │ │   Calendar       │
│   & Runway SVG │ │   Before/After   │ │   Calendar Grid │ │ • Subscription   │
│   Chart        │ │   Delta Matrix   │ │ • Advance Day   │ │   Kill-Switch    │
│ • Health & Risk│ │ • Dual-Trajectory│ │   Stepper       │ │ • Goal Allocator │
│   Factor Radar │ │   Forecast Curve │ │ • Unexpected    │ │5. SMART LEDGER   │
│ • Quick Expense│ │ • 1-Click Commit │ │   Shock Event   │ │ • Search, Filter │
│   & Shock Alert│ │   or Discard     │ │   Resolver Modal│ │   & Audit Trail  │
└────────────────┘ └──────────────────┘ └─────────────────┘ └──────────────────┘
```

### Data Model & Core Mathematical Formulas
1. **Remaining Liquid Balance**:
   $$\text{Liquid Balance} = \text{Starting Budget (₹10,000)} + \text{Additional Income} - \text{Spent to Date} - \text{Savings Allocated}$$
2. **Unsettled Locked Commitments**:
   $$\text{Locked Commitments} = \sum (\text{Upcoming Fixed Bills}) + \sum (\text{Active Unsettled Subscriptions in Cycle})$$
3. **Net Free Spendable Pool**:
   $$\text{Free Spendable Pool} = \text{Liquid Balance} - \text{Locked Commitments}$$
4. **Safe-to-Spend Daily Allowance**:
   $$\text{Daily Allowance} = \max\left(0, \frac{\text{Free Spendable Pool}}{\text{30} - \text{Current Day} + 1}\right)$$
5. **30-Day End-of-Month (EOM) Forecast & Runway Survival Day**:
   - Projects daily balance from `Current Day` to `Day 30` using the user's rolling daily discretionary burn rate plus exact dates of scheduled bills and subscriptions.
   - Identifies the exact **Zero-Cash Date** (e.g., *Day 24 Overdraft Warning*) if projected burn exceeds the Free Spendable Pool.

### Interactive Component & State Mapping
- **Timeline Controls**: `Advance +1 Day`, `Jump to Any Day (1–30)`, and `Trigger Unexpected Event` buttons dynamically update settled transactions, recalculate daily allowance, and surface interactive shock resolution modals.
- **What-If Simulator Controls**: Real-time sliders and preset dilemma buttons (*Buy Sneakers ₹1,800*, *Take Weekend Trip ₹2,200*, *Cancel 2 Subscriptions +₹448*, *Freelance Gig +₹1,500*) compute instant delta metrics without mutating the actual ledger until the user clicks **Apply Decision**.
- **Subscription & Commitment Controls**: Interactive status toggles (`Active` / `Paused`), new commitment form, and savings goal transfer controls (`Deposit`, `Withdraw to Cash`, `Adjust Target`) immediately propagate across all charts and health scores.
- **Smart Ledger & Persona Switcher**: Full search, category filter (`Food & Dining`, `Transport`, `Subscriptions`, `Commitments`, `Shopping`, `Unexpected`, `Income`), sort, add/delete entry, CSV export, and 4 instant Gen Z financial persona presets.
