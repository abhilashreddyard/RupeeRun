/**
 * Automated Verification & Unit Test Suite for RupeeRun Financial Engine
 * Validates deterministic budget formulas, What-If simulations, overdraft detection,
 * and input sanitization invariants.
 */

import { calculateFinancialMetrics } from '../utils/financialEngine';
import { PERSONA_PRESETS, WHAT_IF_TEMPLATES } from '../data/presets';
import {
  sanitizeTextInput,
  sanitizeCurrencyAmount,
  sanitizeCycleDay,
  isValidPersistedSchema,
} from '../utils/security';

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runFinancialEngineTestSuite(): TestResult[] {
  const results: TestResult[] = [];
  const basePreset = PERSONA_PRESETS[0];

  // Test 1: Base ₹10,000 Allocation Invariant
  const metrics = calculateFinancialMetrics(
    {
      currentDay: basePreset.currentDay,
      baseBudget: basePreset.baseBudget,
      emergencyBuffer: basePreset.emergencyBuffer,
      transactions: basePreset.transactions,
      commitments: basePreset.commitments,
      subscriptions: basePreset.subscriptions,
      savingsGoals: basePreset.savingsGoals,
    },
    null
  );

  const invariantSum =
    metrics.spentToDate + metrics.savingsAllocated + metrics.liquidBalance;
  results.push({
    name: 'Capital Conservation Invariant (Spent + Saved + Liquid == Total Inflow)',
    passed: invariantSum === metrics.totalInflow,
    details: `Expected ${metrics.totalInflow}, got ${invariantSum}`,
  });

  // Test 2: Safe Daily Allowance Calculation
  const expectedDaily = Math.max(
    0,
    Math.round(metrics.freeSpendablePool / metrics.remainingDays)
  );
  results.push({
    name: 'Safe-to-Spend Daily Allowance Formula Accuracy',
    passed: metrics.safeDailyAllowance === expectedDaily,
    details: `Safe Daily Allowance = ₹${metrics.safeDailyAllowance}/day across ${metrics.remainingDays} days`,
  });

  // Test 3: What-If Decision Non-Destructive Delta Calculation
  const sneakerSim = calculateFinancialMetrics(
    {
      currentDay: basePreset.currentDay,
      baseBudget: basePreset.baseBudget,
      emergencyBuffer: basePreset.emergencyBuffer,
      transactions: basePreset.transactions,
      commitments: basePreset.commitments,
      subscriptions: basePreset.subscriptions,
      savingsGoals: basePreset.savingsGoals,
    },
    WHAT_IF_TEMPLATES[0].decision // ₹1,800 one-time sneaker spend
  );

  const poolDifference =
    metrics.freeSpendablePool - sneakerSim.freeSpendablePool;
  results.push({
    name: 'What-If Simulator Non-Destructive Pool Delta (₹1,800 Expense)',
    passed: poolDifference === 1800,
    details: `Baseline Free Pool ₹${metrics.freeSpendablePool} -> Simulated ₹${sneakerSim.freeSpendablePool}`,
  });

  // Test 4: XSS & Input Sanitization Guard
  const maliciousInput = '<script>alert("xss")</script>Coffee & Chai';
  const cleaned = sanitizeTextInput(maliciousInput);
  results.push({
    name: 'Security XSS Script Tag Stripping',
    passed: cleaned === 'Coffee & Chai',
    details: `Sanitized output: "${cleaned}"`,
  });

  // Test 5: Numeric & Cycle Day Bounds Clamping
  const clampedDay = sanitizeCycleDay(99);
  const clampedAmt = sanitizeCurrencyAmount(-500, 1, 50000);
  results.push({
    name: 'Boundary Clamping for Cycle Days (1..30) & Currency Amounts',
    passed: clampedDay === 30 && clampedAmt === 1,
    details: `Clamped Day=${clampedDay}, Clamped Amount=${clampedAmt}`,
  });

  // Test 6: Schema Validation Guard
  const validSchema = isValidPersistedSchema({
    currentDay: 8,
    baseBudget: 10000,
    transactions: [],
    commitments: [],
    subscriptions: [],
    savingsGoals: [],
  });
  results.push({
    name: 'LocalStorage Hydrated Schema Validation',
    passed: validSchema === true,
    details: `Schema validation passed: ${validSchema}`,
  });

  return results;
}
