import {
  DailyProjectionPoint,
  FinancialMetrics,
  FixedCommitment,
  HealthFactorBreakdown,
  SavingsGoal,
  SubscriptionItem,
  Transaction,
  WhatIfDecision,
} from '../types/finance';

export interface EngineStateInput {
  currentDay: number;
  baseBudget: number;
  emergencyBuffer: number;
  transactions: Transaction[];
  commitments: FixedCommitment[];
  subscriptions: SubscriptionItem[];
  savingsGoals: SavingsGoal[];
}

export function calculateFinancialMetrics(
  state: EngineStateInput,
  whatIfDecision?: WhatIfDecision | null
): FinancialMetrics {
  const {
    currentDay,
    baseBudget,
    emergencyBuffer,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
  } = state;

  // Clone collections so we can apply What-If mutations non-destructively
  const effectiveTransactions = [...transactions];
  const effectiveCommitments = commitments.map(c => ({ ...c }));
  let effectiveSubscriptions = subscriptions.map(s => ({ ...s }));
  const effectiveGoals = savingsGoals.map(g => ({ ...g }));
  let effectiveEmergencyBuffer = emergencyBuffer;

  let recurringDailySimAdd = 0;
  let recurringDailySimStartDay = currentDay;

  if (whatIfDecision && whatIfDecision.amount > 0) {
    const trigDay = Math.max(currentDay, Math.min(30, whatIfDecision.triggerDay || currentDay));
    if (whatIfDecision.type === 'one_time_expense') {
      effectiveTransactions.push({
        id: 'sim-one-time',
        day: trigDay,
        title: whatIfDecision.title,
        category: whatIfDecision.category,
        amount: whatIfDecision.amount,
        type: 'expense',
        isEssential: whatIfDecision.isEssential,
      });
    } else if (whatIfDecision.type === 'recurring_daily') {
      recurringDailySimAdd = whatIfDecision.amount;
      recurringDailySimStartDay = trigDay;
    } else if (whatIfDecision.type === 'new_subscription') {
      effectiveSubscriptions.push({
        id: 'sim-sub',
        name: whatIfDecision.title,
        category: 'Entertainment',
        amount: whatIfDecision.amount,
        billingDay: trigDay,
        status: 'active',
        isSettledThisMonth: false,
        usageScore: 60,
      });
    } else if (whatIfDecision.type === 'pause_subscriptions') {
      // Pause unsettled active subscriptions up to the amount or all low-usage unsettled subs
      let savedSoFar = 0;
      effectiveSubscriptions = effectiveSubscriptions.map(sub => {
        if (sub.status === 'active' && !sub.isSettledThisMonth && sub.billingDay >= currentDay) {
          if (savedSoFar < whatIfDecision.amount) {
            savedSoFar += sub.amount;
            return { ...sub, status: 'paused' as const };
          }
        }
        return sub;
      });
    } else if (whatIfDecision.type === 'savings_boost') {
      if (effectiveGoals.length > 0) {
        effectiveGoals[0].savedAmount += whatIfDecision.amount;
      } else {
        effectiveEmergencyBuffer += whatIfDecision.amount;
      }
    } else if (whatIfDecision.type === 'extra_income') {
      effectiveTransactions.push({
        id: 'sim-income',
        day: trigDay,
        title: whatIfDecision.title,
        category: 'Extra Income',
        amount: whatIfDecision.amount,
        type: 'income',
        isEssential: true,
      });
    }
  }

  // 1. Inflows & Past Transactions (up to currentDay, plus any simulated immediate transaction on currentDay)
  const settledTransactions = effectiveTransactions.filter(t => t.day <= currentDay);
  const futureSimTransactions = effectiveTransactions.filter(t => t.day > currentDay);

  const extraIncomeToDate = settledTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const futureExtraIncome = futureSimTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInflow = baseBudget + extraIncomeToDate;

  const spentToDate = settledTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const discretionarySpentToDate = settledTransactions
    .filter(t => t.type === 'expense' && !t.isEssential)
    .reduce((sum, t) => sum + t.amount, 0);

  const essentialSpentToDate = settledTransactions
    .filter(t => t.type === 'expense' && t.isEssential)
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Savings & Emergency Buffer
  const goalsSavedTotal = effectiveGoals.reduce((sum, g) => sum + g.savedAmount, 0);
  const savingsAllocated = goalsSavedTotal + effectiveEmergencyBuffer;

  // 3. Liquid Balance right now
  const liquidBalance = totalInflow - spentToDate - savingsAllocated;

  // 4. Upcoming Commitments & Active Unsettled Subscriptions
  const upcomingCommitmentsTotal = effectiveCommitments
    .filter(c => !c.isPaid && c.dueDay >= currentDay)
    .reduce((sum, c) => sum + c.amount, 0);

  const upcomingSubscriptionsTotal = effectiveSubscriptions
    .filter(s => s.status === 'active' && !s.isSettledThisMonth && s.billingDay >= currentDay)
    .reduce((sum, s) => sum + s.amount, 0);

  const futureOneTimeSimExpenses = futureSimTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingDays = Math.max(1, 30 - currentDay + 1);
  const futureRecurringSimTotal =
    recurringDailySimAdd > 0
      ? recurringDailySimAdd * Math.max(0, 30 - Math.max(currentDay, recurringDailySimStartDay) + 1)
      : 0;

  const lockedFundsTotal =
    upcomingCommitmentsTotal +
    upcomingSubscriptionsTotal +
    futureOneTimeSimExpenses +
    futureRecurringSimTotal;

  // 5. Net Free Spendable Pool & Safe Daily Allowance
  const freeSpendablePool = liquidBalance + futureExtraIncome - lockedFundsTotal;
  const safeDailyAllowance = Math.max(0, Math.round(freeSpendablePool / remainingDays));

  // 6. Daily Discretionary Burn Rate (excluding large fixed Day-1 commitments so projection is realistic)
  const nonCommitmentExpenses = settledTransactions.filter(
    t => t.type === 'expense' && t.category !== 'Commitments & Bills' && t.category !== 'Subscriptions'
  );
  const nonCommitmentSum = nonCommitmentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const elapsedDays = Math.max(1, currentDay);
  const baselineDailyBurn = Math.max(110, Math.round(nonCommitmentSum / elapsedDays));
  const currentDailyBurnAvg = baselineDailyBurn + recurringDailySimAdd;

  // 7. Build 30-Day Daily Trajectory Projection
  const dailyProjections: DailyProjectionPoint[] = [];
  let runningBalance = baseBudget - savingsAllocated;
  let projectedZeroCashDay: number | null = null;

  for (let d = 1; d <= 30; d++) {
    const isProjected = d > currentDay;
    const eventsOnDay: string[] = [];
    let dayExpense = 0;
    let dayIncome = 0;
    let commitmentSettled = 0;
    let subscriptionSettled = 0;

    if (!isProjected) {
      const dayTxs = effectiveTransactions.filter(t => t.day === d);
      dayTxs.forEach(t => {
        if (t.type === 'expense') {
          dayExpense += t.amount;
          eventsOnDay.push(`${t.title} (-₹${t.amount})`);
          if (t.category === 'Commitments & Bills') commitmentSettled += t.amount;
          if (t.category === 'Subscriptions') subscriptionSettled += t.amount;
        } else if (t.type === 'income') {
          dayIncome += t.amount;
          eventsOnDay.push(`${t.title} (+₹${t.amount})`);
        }
      });
      if (d === currentDay && recurringDailySimAdd > 0 && currentDay >= recurringDailySimStartDay) {
        dayExpense += recurringDailySimAdd;
        eventsOnDay.push(`${whatIfDecision?.title || 'Simulated Daily Spend'} (-₹${recurringDailySimAdd})`);
      }
    } else {
      // Projected future day
      dayExpense += baselineDailyBurn;
      if (recurringDailySimAdd > 0 && d >= recurringDailySimStartDay) {
        dayExpense += recurringDailySimAdd;
      }

      // Scheduled unpaid commitments on day d
      effectiveCommitments
        .filter(c => !c.isPaid && c.dueDay === d)
        .forEach(c => {
          dayExpense += c.amount;
          commitmentSettled += c.amount;
          eventsOnDay.push(`Due: ${c.title} (-₹${c.amount})`);
        });

      // Scheduled active subscriptions on day d
      effectiveSubscriptions
        .filter(s => s.status === 'active' && !s.isSettledThisMonth && s.billingDay === d)
        .forEach(s => {
          dayExpense += s.amount;
          subscriptionSettled += s.amount;
          eventsOnDay.push(`Auto-Debit: ${s.name} (-₹${s.amount})`);
        });

      // Future simulated transactions on day d
      futureSimTransactions
        .filter(t => t.day === d)
        .forEach(t => {
          if (t.type === 'expense') {
            dayExpense += t.amount;
            eventsOnDay.push(`Sim: ${t.title} (-₹${t.amount})`);
          } else if (t.type === 'income') {
            dayIncome += t.amount;
            eventsOnDay.push(`Sim: ${t.title} (+₹${t.amount})`);
          }
        });
    }

    runningBalance = runningBalance + dayIncome - dayExpense;
    if (runningBalance < 0 && projectedZeroCashDay === null) {
      projectedZeroCashDay = d;
    }

    // Remaining locked commitments from day d+1..30
    const remainingLockedAfterDay =
      effectiveCommitments
        .filter(c => !c.isPaid && c.dueDay > d)
        .reduce((s, c) => s + c.amount, 0) +
      effectiveSubscriptions
        .filter(s => s.status === 'active' && !s.isSettledThisMonth && s.billingDay > d)
        .reduce((s, sub) => s + sub.amount, 0);

    dailyProjections.push({
      day: d,
      actualOrProjectedBalance: Math.round(runningBalance),
      freeSpendableBalance: Math.round(runningBalance - remainingLockedAfterDay),
      dailySpend: Math.round(dayExpense),
      commitmentSettled,
      subscriptionSettled,
      isProjected,
      events: eventsOnDay,
    });
  }

  const projectedEndOfMonthBalance =
    dailyProjections[dailyProjections.length - 1]?.actualOrProjectedBalance ?? 0;

  // 8. Multi-Factor Financial Health & Risk Engine
  // Factor 1: Burn Rate Alignment (25%) — compare currentDailyBurnAvg vs safeDailyAllowance
  let burnScore = 100;
  if (safeDailyAllowance <= 0) {
    burnScore = 10;
  } else {
    const burnRatio = currentDailyBurnAvg / Math.max(1, safeDailyAllowance);
    if (burnRatio <= 0.85) burnScore = 95;
    else if (burnRatio <= 1.0) burnScore = 84;
    else if (burnRatio <= 1.25) burnScore = Math.round(80 - (burnRatio - 1) * 120);
    else burnScore = Math.max(15, Math.round(50 - (burnRatio - 1.25) * 60));
  }

  // Factor 2: Commitment Coverage Ratio (25%) — can liquid balance comfortably cover locked bills?
  let commitmentScore = 100;
  if (lockedFundsTotal > 0) {
    const coverageRatio = (liquidBalance + futureExtraIncome) / lockedFundsTotal;
    if (coverageRatio >= 2.2) commitmentScore = 96;
    else if (coverageRatio >= 1.5) commitmentScore = 82;
    else if (coverageRatio >= 1.1) commitmentScore = 62;
    else commitmentScore = Math.max(10, Math.round(coverageRatio * 45));
  }

  // Factor 3: Savings & Emergency Resilience (20%) — target is >= 18% of 10,000 (₹1,800)
  const savingsRatio = savingsAllocated / baseBudget;
  const savingsScore = Math.min(100, Math.max(15, Math.round((savingsRatio / 0.22) * 100)));

  // Factor 4: Subscription Load & Efficiency (15%)
  const totalActiveSubsCost = effectiveSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);
  const lowValueSubsCount = effectiveSubscriptions.filter(
    s => s.status === 'active' && s.usageScore < 50
  ).length;
  const subRatio = totalActiveSubsCost / baseBudget;
  let subScore = 92;
  if (subRatio > 0.08 || lowValueSubsCount >= 2) {
    subScore = Math.max(30, 90 - Math.round(subRatio * 400) - lowValueSubsCount * 12);
  } else if (lowValueSubsCount === 1) {
    subScore = 76;
  }

  // Factor 5: 30-Day Runway Survival Margin (15%)
  let runwayScore = 95;
  if (projectedZeroCashDay !== null) {
    runwayScore = Math.max(5, Math.round(((projectedZeroCashDay - currentDay) / remainingDays) * 45));
  } else if (projectedEndOfMonthBalance < 300) {
    runwayScore = 60;
  } else if (projectedEndOfMonthBalance < 800) {
    runwayScore = 78;
  }

  const financialHealthScore = Math.round(
    burnScore * 0.25 +
      commitmentScore * 0.25 +
      savingsScore * 0.2 +
      subScore * 0.15 +
      runwayScore * 0.15
  );

  const riskScore = Math.max(0, Math.min(100, 100 - financialHealthScore));

  let riskLevel: FinancialMetrics['riskLevel'] = 'LOW RISK';
  if (projectedZeroCashDay !== null || freeSpendablePool < 0) {
    riskLevel = 'CRITICAL OVERDRAFT';
  } else if (financialHealthScore < 55 || safeDailyAllowance < 90) {
    riskLevel = 'HIGH RISK';
  } else if (financialHealthScore < 75 || safeDailyAllowance < 140) {
    riskLevel = 'MODERATE RISK';
  }

  const healthFactors: HealthFactorBreakdown[] = [
    {
      name: 'Daily Burn Velocity',
      score: burnScore,
      weight: 25,
      status: burnScore >= 75 ? 'NOMINAL' : burnScore >= 50 ? 'TIGHTENING' : 'CRITICAL',
      detail: `Avg ₹${currentDailyBurnAvg}/day burn vs ₹${safeDailyAllowance}/day safe limit`,
    },
    {
      name: 'Commitment Coverage',
      score: commitmentScore,
      weight: 25,
      status: commitmentScore >= 75 ? 'NOMINAL' : commitmentScore >= 50 ? 'TIGHTENING' : 'CRITICAL',
      detail: `₹${lockedFundsTotal.toLocaleString('en-IN')} locked across upcoming bills & subs`,
    },
    {
      name: 'Savings & Shock Buffer',
      score: savingsScore,
      weight: 20,
      status: savingsScore >= 75 ? 'NOMINAL' : savingsScore >= 50 ? 'TIGHTENING' : 'CRITICAL',
      detail: `₹${savingsAllocated.toLocaleString('en-IN')} protected (${Math.round(savingsRatio * 100)}% of budget)`,
    },
    {
      name: 'Subscription Efficiency',
      score: subScore,
      weight: 15,
      status: subScore >= 75 ? 'NOMINAL' : subScore >= 50 ? 'TIGHTENING' : 'CRITICAL',
      detail: `₹${totalActiveSubsCost}/mo active (${lowValueSubsCount} low-usage drains detected)`,
    },
    {
      name: '30-Day Runway Margin',
      score: runwayScore,
      weight: 15,
      status: runwayScore >= 75 ? 'NOMINAL' : runwayScore >= 50 ? 'TIGHTENING' : 'CRITICAL',
      detail:
        projectedZeroCashDay !== null
          ? `Overdraft projected on Day ${projectedZeroCashDay}`
          : `Projected Day 30 surplus of ₹${projectedEndOfMonthBalance.toLocaleString('en-IN')}`,
    },
  ];

  // Actionable smart recommendations
  const recommendations: string[] = [];
  if (lowValueSubsCount > 0) {
    const lowSubs = effectiveSubscriptions.filter(s => s.status === 'active' && s.usageScore < 50 && !s.isSettledThisMonth);
    const reclaimable = lowSubs.reduce((sum, s) => sum + s.amount, 0);
    if (reclaimable > 0) {
      recommendations.push(
        `Pause ${lowSubs.length} low-usage subscriptions (${lowSubs.map(s => s.name.split(' ')[0]).join(', ')}) before their billing date to reclaim ₹${reclaimable} (+₹${Math.round(reclaimable / remainingDays)}/day allowance).`
      );
    }
  }
  if (projectedZeroCashDay !== null) {
    const deficit = Math.abs(projectedEndOfMonthBalance);
    recommendations.push(
      `Cash runway exhausts on Day ${projectedZeroCashDay}. Reduce daily variable spend by ₹${Math.ceil(deficit / remainingDays)}/day or release ₹${Math.min(effectiveEmergencyBuffer, deficit)} from Emergency Buffer.`
    );
  } else if (currentDailyBurnAvg > safeDailyAllowance) {
    recommendations.push(
      `Your rolling variable burn (₹${currentDailyBurnAvg}/day) exceeds your safe daily allowance (₹${safeDailyAllowance}/day) by ₹${currentDailyBurnAvg - safeDailyAllowance}/day.`
    );
  } else {
    recommendations.push(
      `Runway is healthy: maintaining under ₹${safeDailyAllowance}/day leaves a projected ₹${projectedEndOfMonthBalance.toLocaleString('en-IN')} month-end surplus for your savings goals.`
    );
  }

  return {
    baseBudget,
    extraIncomeToDate,
    totalInflow,
    spentToDate,
    discretionarySpentToDate,
    essentialSpentToDate,
    savingsAllocated,
    emergencyBuffer: effectiveEmergencyBuffer,
    liquidBalance,
    upcomingCommitmentsTotal,
    upcomingSubscriptionsTotal,
    lockedFundsTotal,
    freeSpendablePool,
    remainingDays,
    safeDailyAllowance,
    currentDailyBurnAvg,
    projectedEndOfMonthBalance,
    projectedZeroCashDay,
    financialHealthScore,
    riskLevel,
    riskScore,
    healthFactors,
    dailyProjections,
    recommendations,
  };
}
