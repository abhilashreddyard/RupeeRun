import { useState, useEffect, useCallback } from 'react';
import {
  FixedCommitment,
  PersonaPreset,
  SavingsGoal,
  ShockOption,
  SubscriptionItem,
  Transaction,
  UnexpectedEvent,
  WhatIfDecision,
} from '../types/finance';
import { PERSONA_PRESETS, WHAT_IF_TEMPLATES } from '../data/presets';
import { loadPersistedState, savePersistedState } from '../services/storageService';

export function useFinancialStore() {
  const defaultPreset = PERSONA_PRESETS[0];

  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [currentDay, setCurrentDay] = useState<number>(defaultPreset.currentDay);
  const [baseBudget, setBaseBudget] = useState<number>(defaultPreset.baseBudget);
  const [emergencyBuffer, setEmergencyBuffer] = useState<number>(defaultPreset.emergencyBuffer);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultPreset.transactions);
  const [commitments, setCommitments] = useState<FixedCommitment[]>(defaultPreset.commitments);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(
    defaultPreset.subscriptions
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(defaultPreset.savingsGoals);
  const [unexpectedEvents, setUnexpectedEvents] = useState<UnexpectedEvent[]>(
    defaultPreset.unexpectedEvents
  );
  const [whatIfDecision, setWhatIfDecision] = useState<WhatIfDecision>(
    WHAT_IF_TEMPLATES[0].decision
  );

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      setActivePresetId(saved.activePresetId || defaultPreset.id);
      setCurrentDay(saved.currentDay);
      setBaseBudget(saved.baseBudget || 10000);
      setEmergencyBuffer(saved.emergencyBuffer ?? defaultPreset.emergencyBuffer);
      setTransactions(saved.transactions || defaultPreset.transactions);
      setCommitments(saved.commitments || defaultPreset.commitments);
      setSubscriptions(saved.subscriptions || defaultPreset.subscriptions);
      setSavingsGoals(saved.savingsGoals || defaultPreset.savingsGoals);
      setUnexpectedEvents(saved.unexpectedEvents || defaultPreset.unexpectedEvents);
    }
  }, [defaultPreset]);

  // Persist state on change
  useEffect(() => {
    savePersistedState({
      activePresetId,
      currentDay,
      baseBudget,
      emergencyBuffer,
      transactions,
      commitments,
      subscriptions,
      savingsGoals,
      unexpectedEvents,
    });
  }, [
    activePresetId,
    currentDay,
    baseBudget,
    emergencyBuffer,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    unexpectedEvents,
  ]);

  const selectPreset = useCallback((preset: PersonaPreset) => {
    setActivePresetId(preset.id);
    setCurrentDay(preset.currentDay);
    setBaseBudget(preset.baseBudget);
    setEmergencyBuffer(preset.emergencyBuffer);
    setTransactions(preset.transactions);
    setCommitments(preset.commitments);
    setSubscriptions(preset.subscriptions);
    setSavingsGoals(preset.savingsGoals);
    setUnexpectedEvents(preset.unexpectedEvents);
    setWhatIfDecision({
      ...WHAT_IF_TEMPLATES[0].decision,
      triggerDay: preset.currentDay,
    });
  }, []);

  const resolveShockEvent = useCallback(
    (eventId: string, option: ShockOption) => {
      const targetEvt = unexpectedEvents.find(e => e.id === eventId);
      if (!targetEvt) return null;

      setTransactions(prev => {
        const next = [...prev];
        if (option.cashImpact > 0) {
          next.push({
            id: `tx-shock-${Date.now()}`,
            day: currentDay,
            title: `${targetEvt.title} (${option.label.split(' (')[0]})`,
            category: 'Unexpected Shock',
            amount: option.cashImpact,
            type: 'expense',
            isEssential: true,
            note: option.healthNote,
          });
        }
        if (option.incomeAdded && option.incomeAdded > 0) {
          next.push({
            id: `tx-gig-${Date.now()}`,
            day: currentDay,
            title: targetEvt.title,
            category: 'Extra Income',
            amount: option.incomeAdded,
            type: 'income',
            isEssential: true,
            note: option.healthNote,
          });
        }
        return next;
      });

      if (option.savingsImpact !== 0) {
        setEmergencyBuffer(prev => Math.max(0, prev - option.savingsImpact));
      }

      setUnexpectedEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, resolved: true, chosenOptionId: option.id } : e
        )
      );

      return option.label;
    },
    [unexpectedEvents, currentDay]
  );

  return {
    activePresetId,
    currentDay,
    setCurrentDay,
    baseBudget,
    emergencyBuffer,
    setEmergencyBuffer,
    transactions,
    setTransactions,
    commitments,
    setCommitments,
    subscriptions,
    setSubscriptions,
    savingsGoals,
    setSavingsGoals,
    unexpectedEvents,
    setUnexpectedEvents,
    whatIfDecision,
    setWhatIfDecision,
    selectPreset,
    resolveShockEvent,
  };
}
