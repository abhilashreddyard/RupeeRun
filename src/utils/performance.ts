/**
 * Performance Telemetry & Core Web Vitals Monitor
 * Tracks render latency, memory footprint, and simulation calculation speed.
 */

export interface PerformanceTelemetry {
  lastCalculationDurationMs: number;
  navigationTimingMs: number;
  preferReducedMotion: boolean;
}

/**
 * Measures execution duration of synchronous calculation functions in milliseconds.
 */
export function measureExecutionTime<T>(fn: () => T): { result: T; durationMs: number } {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const result = fn();
  const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    result,
    durationMs: Number((end - start).toFixed(3)),
  };
}

/**
 * Detects whether the user has requested reduced motion at the OS/browser level.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Format Indian Rupee currency cleanly with tabular consistency.
 */
export function formatINR(amount: number, showSign = false): string {
  const rounded = Math.round(amount);
  const absFormatted = Math.abs(rounded).toLocaleString('en-IN');
  if (rounded < 0) return `-₹${absFormatted}`;
  if (showSign && rounded > 0) return `+₹${absFormatted}`;
  return `₹${absFormatted}`;
}
