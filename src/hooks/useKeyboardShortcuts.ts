import { useEffect } from 'react';
import { NAVIGATION_TABS } from '../constants/config';
import { ActiveTab } from '../context/FinancialContext';

/**
 * Custom keyboard navigation hook supporting Alt+1..5 view switching
 * and Escape key modal dismissal for WCAG 2.1 AA accessibility compliance.
 */
export function useKeyboardShortcuts(
  onSelectTab: (tab: ActiveTab) => void,
  onEscape?: () => void
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (event.altKey && ['1', '2', '3', '4', '5'].includes(event.key)) {
        event.preventDefault();
        const index = Number(event.key) - 1;
        const target = NAVIGATION_TABS[index];
        if (target) {
          onSelectTab(target.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab, onEscape]);
}
