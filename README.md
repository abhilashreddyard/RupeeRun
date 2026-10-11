# RupeeRun — Broke But Functional: Survive the Month (30-Day ₹10,000 Financial Cockpit)

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-38BDF8?style=for-the-badge)](https://abhilashreddyard.github.io/RupeeRun/)
[![Stack](https://img.shields.io/badge/Stack-React_19_%7C_TypeScript_%7C_Vite_8_%7C_Tailwind_v4-10B981?style=for-the-badge)](https://github.com/abhilashreddyard/rupeerun)
[![Hackathon](https://img.shields.io/badge/PROMPT_RUN-Vibe_Coding_Hackathon-6366F1?style=for-the-badge)](https://abhilashreddyard.github.io/RupeeRun/)

**RupeeRun** is an interactive consumer fintech cockpit and pre-decision simulation engine built for Gen Z users navigating a strict **₹10,000 monthly budget over a 30-day cycle**. Instead of acting as a passive retroactive expense tracker, RupeeRun connects **income, liquid balance, fixed commitments, recurring subscriptions, savings goals, emergency shock buffers, unexpected life events, and a live "What-If" decision simulator** into one unified mathematical model.

🔗 **Live Production URL:** [https://abhilashreddyard.github.io/RupeeRun/](https://abhilashreddyard.github.io/RupeeRun/)

---

## Table of Contents

1. [Problem Statement & Solution Overview](#1-problem-statement--solution-overview)
2. [Key Features & Interconnected Capabilities](#2-key-features--interconnected-capabilities)
3. [System Architecture & Directory Structure](#3-system-architecture--directory-structure)
4. [Core Financial Formulas & Mathematical Model](#4-core-financial-formulas--mathematical-model)
5. [Technology Stack](#5-technology-stack)
6. [Local Setup, Installation & Build Instructions](#6-local-setup-installation--build-instructions)
7. [Deployment Guide (GitHub Pages / Vercel)](#7-deployment-guide-github-pages--vercel)
8. [Evaluation & Accessibility Highlights](#8-evaluation--accessibility-highlights)

---

## 1. Problem Statement & Solution Overview

Gen Z college students, interns, and early-career young adults frequently manage tight monthly allowances (₹10,000/month) across dozens of UPI micro-transactions, shared group splits, OTT subscriptions, and sudden mid-month emergencies. Traditional expense trackers only tell users where their money *went* after they are already broke on Day 22.

**RupeeRun solves this by making every financial decision's ripple effects visible before the money is spent:**
- How does a ₹1,250 concert pass or a ₹120/day iced coffee habit compress your **Safe-to-Spend Daily Allowance** for the remaining days of the month?
- Which exact day (`Day 1–30`) will your cash trajectory cross below `₹0` if you don't pause low-usage subscriptions?
- When an unexpected shock strikes (e.g., laptop charger short-circuit or sudden pharmacy bill), is it smarter to absorb it from liquid cash, tap the Emergency Shock Buffer, or choose a certified refurbished alternative?

---

## 2. Key Features & Interconnected Capabilities

### 1. 30-Day ₹10,000 Command Cockpit (`CockpitView`)
- **6 Interlinked Real-Time KPIs**: Remaining Liquid Cash, Locked Bills & Subscriptions, True Free Spendable Pool, Safe-to-Spend Daily Allowance (`₹/day`), Protected Savings & Shock Shield, and Composite Financial Health Score (`0–100`).
- **₹10,000 Capital Allocation Breakdown Bar**: Visualizes the exact proportion of capital across *Spent to Date*, *Locked Commitments/Subs*, *Protected Savings*, and *Free Runway*.
- **30-Day Recharts Savings Goal Progress Ring**: Interactive radial donut chart (`Recharts`) with per-goal filtering, instant `+₹250` boost controls, and spring-animated milestone completion celebration (`motion/react`).
- **5-Factor Weighted Financial Health & Risk Diagnostic**: Transparent breakdown across *Daily Burn Velocity (25%)*, *Commitment Coverage (25%)*, *Savings & Shock Buffer (20%)*, *Subscription Efficiency (15%)*, and *30-Day Runway Margin (15%)*.
- **Behavioral Fintech Copilot & Survival Sprint Challenges**: Real-time financial archetype classification (*Compound Architect*, *Balanced Navigator*, *Impulse Sprinter*, *Subscription Collector*) with 1-click auto-optimization and 3 interactive 30-day survival sprint challenges.

### 2. Live "What-If" Decision Simulator (`WhatIfSandboxView`)
- **6 Simulation Mechanisms**: Test *One-Time Spend*, *Daily Habit (`/day`)*, *New Subscription*, *Pause Subscriptions*, *Lock in Savings*, or *Side-Gig Income*.
- **Curated Gen Z Dilemma Templates**: 1-click simulation presets (*Flash Sale Sneakers ₹1,800*, *Indie Music Festival Pass ₹1,250*, *Daily ₹120 Iced Latte*, *Pause Unused OTT Perks +₹548*, *Weekend UI/UX Micro-Gig +₹1,500*).
- **Side-by-Side Before vs. After Impact Matrix**: Compares Current Baseline vs. Simulated Trajectory across all 6 financial dimensions with exact rupee and point deltas.
- **Dual-Trajectory 30-Day Forecast Curve**: Custom interactive SVG chart plotting actual history, baseline forecast, and simulated "What-If" curve side by side.

### 3. Interactive 30-Day Timeline & Unexpected Life Events (`TimelineView` & `ShockEventModal`)
- **Day-by-Day Stepper (`Advance Day +1`) & Direct Day Jumper (`D1–D30`)**: Automatically settles scheduled commitments and subscription auto-debits on their billing dates.
- **Interactive Unexpected Life Events**: Realistic multi-option shock dilemmas (*Laptop Charger Failure*, *Friend Surprise Birthday Split*, *Viral Fever Pharmacy Bill*, *Weekend Freelance Gig*) where each option displays exact cash, buffer, and daily allowance consequences.

### 4. Commitments, Subscription Kill-Switch & Savings Vaults (`CommitmentsAndGoalsView`)
- **Fixed Commitment Manager**: Track and settle mandatory bills (*Hostel/PG Share*, *5G Data Pack*, *Shared Fiber Wi-Fi*, *Mess Settlement*) or lock new commitments.
- **Subscription Kill-Switch**: Identifies low-usage subscription drains (`Usage Score < 50%`) and shows the exact `+/day` allowance reclaimed when paused.
- **Protected Savings & Emergency Shock Buffer**: Deposit or release funds between liquid spendable cash, the Emergency Shock Shield, and priority savings goals.

### 5. Smart Transaction Ledger & Instant Consequence Logger (`SmartLedgerView`)
- **Pre-Commit Allowance Preview**: Shows how any new expense or inflow changes the Safe Daily Allowance *before* submitting the form.
- **Search, Priority Filtering & CSV Export**: Filter by *Essential Needs*, *Discretionary Wants*, *Income*, or specific categories, and export the full 30-day audit trail to CSV.

---

## 3. System Architecture & Directory Structure

RupeeRun follows a clean, layered React + TypeScript architecture separating domain types, pure mathematical calculation engines, state hooks, context providers, storage services, and lazy-loaded view components:

```text
rupeerun/
├── .github/workflows/
│   └── static.yml                     # Automated CI/CD build & GitHub Pages deployment
├── docs/
│   └── ARCHITECTURE.md                # Deep-dive system architecture & mathematical specs
├── src/
│   ├── components/
│   │   ├── CockpitView.tsx            # Primary 30-day command cockpit & health telemetry
│   │   ├── WhatIfSandboxView.tsx      # Side-by-side Before/After decision simulator
│   │   ├── TimelineView.tsx           # Interactive D1-D30 calendar & shock trigger engine
│   │   ├── CommitmentsAndGoalsView.tsx# Fixed bills, subscription kill-switch & vaults
│   │   ├── SmartLedgerView.tsx        # Filterable transaction audit table & CSV export
│   │   ├── SavingsGoalProgressRing.tsx# Recharts radial progress ring + completion motion
│   │   ├── TrajectoryChart.tsx        # Dual-curve 30-day SVG balance & overdraft chart
│   │   ├── FinancialCopilotWidget.tsx # Behavioral archetype detector & sprint challenges
│   │   ├── ShockEventModal.tsx        # Multi-option unexpected expense resolution modal
│   │   └── ErrorBoundary.tsx          # Fault-tolerant recovery boundary
│   ├── constants/
│   │   └── config.ts                  # Application constants, categories & challenge specs
│   ├── context/
│   │   └── FinancialContext.tsx       # Unified React Context provider & action dispatchers
│   ├── data/
│   │   └── presets.ts                 # Persona presets, shock events & What-If templates
│   ├── hooks/
│   │   └── useFinancialStore.ts       # Custom state & persistence synchronization hook
│   ├── services/
│   │   └── storageService.ts          # LocalStorage persistence & CSV export service
│   ├── types/
│   │   └── finance.ts                 # Strict TypeScript interfaces for all financial entities
│   ├── utils/
│   │   └── financialEngine.ts         # Pure deterministic 30-day financial & risk engine
│   ├── App.tsx                        # Root workspace with Suspense lazy code-splitting
│   ├── main.tsx                       # Application DOM entry point
│   └── index.css                      # Tailwind v4 configuration & tabular numeral rules
├── index.html                         # Semantic HTML5 entry with SEO & OpenGraph metadata
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # Strict TypeScript compiler configuration
└── vite.config.ts                     # Vite 8 bundler & code-splitting configuration
```

---

## 4. Core Financial Formulas & Mathematical Model

Every interaction in **RupeeRun** triggers a deterministic recalculation in `src/utils/financialEngine.ts`:

1. **Remaining Liquid Balance**:
   $$\text{Liquid Balance} = \text{Base Budget (₹10,000)} + \text{Extra Income} - \text{Spent to Date} - \text{Savings Allocated}$$
2. **Locked Obligations (Unsettled Commitments + Active Subscriptions)**:
   $$\text{Locked Funds} = \sum_{\text{unpaid}} \text{Commitments} + \sum_{\text{active, unsettled}} \text{Subscriptions}$$
3. **True Free Spendable Pool**:
   $$\text{Free Spendable Pool} = \text{Liquid Balance} - \text{Locked Funds}$$
4. **Safe-to-Spend Daily Allowance**:
   $$\text{Safe Daily Allowance} = \max\left(0, \text{round}\left(\frac{\text{Free Spendable Pool}}{30 - \text{Current Day} + 1}\right)\right)$$
5. **Composite Financial Health Score (`0–100`)**:
   $$\text{Health Score} = 0.25(\text{BurnScore}) + 0.25(\text{CommitmentScore}) + 0.20(\text{SavingsScore}) + 0.15(\text{SubScore}) + 0.15(\text{RunwayScore})$$

---

## 5. Technology Stack

- **Frontend Framework**: React 19 (`react`, `react-dom`) with TypeScript 5+
- **Build System & Bundler**: Vite 8 (`@vitejs/plugin-react`, route-level `React.lazy` code splitting)
- **Styling System**: Tailwind CSS v4 (`@tailwindcss/vite`) with strict dark fintech tokens and `tabular-nums` alignment
- **Data Visualization**: `Recharts` (radial savings progress ring) + Custom High-Precision SVG (`TrajectoryChart` dual-curve 30-day projection)
- **Animation & Micro-Interactions**: `motion` (`motion/react` spring physics & completion transitions)
- **Icons**: `lucide-react`

---

## 6. Local Setup, Installation & Build Instructions

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` recommended
- **npm**: `v10+`

### Step-by-Step Commands

```bash
# 1. Clone the repository
git clone https://github.com/abhilashreddyard/rupeerun.git
cd rupeerun

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start the development server on port 3000
npm run dev

# 4. Type-check the codebase
npm run lint

# 5. Build the production bundle into ./dist
npm run build

# 6. Preview the production build locally
npm run preview
```

---

## 7. Deployment Guide (GitHub Pages / Vercel)

### Automated GitHub Pages Deployment
This repository includes a pre-configured GitHub Actions workflow at `.github/workflows/static.yml` and relative asset resolution (`base: './'` in `vite.config.ts`).
1. Go to **Settings → Pages** in your GitHub repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `main` — GitHub Actions automatically compiles `./dist` and deploys to `https://abhilashreddyard.github.io/RupeeRun/`.

---

## 8. Evaluation & Accessibility Highlights

- **WCAG AA High-Contrast Dark Telemetry**: Semantic status colors are always paired with explicit text labels (`LOW RISK`, `MODERATE RISK`, `CRITICAL OVERDRAFT`, `NOMINAL`, `TIGHTENING`).
- **Keyboard Navigation & Screen Reader Support**: Includes skip-to-content link, `Alt + 1..5` view shortcuts, ARIA landmarks (`banner`, `main`, `navigation`, `contentinfo`, `dialog`), and `aria-live="polite"` status announcements.
- **Tabular Numeral Discipline**: Every rupee value, delta table, and day counter enforces `font-variant-numeric: tabular-nums` (`JetBrains Mono`) for zero layout jitter.
