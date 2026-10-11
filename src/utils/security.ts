/**
 * Security & Input Sanitization Utilities
 * Protects against XSS injection, malformed numeric payloads, and invalid state bounds.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitizes user-entered text strings by stripping control characters,
 * script tags, and dangerous HTML sequences while preserving human-readable text.
 */
export function sanitizeTextInput(raw: string, maxLength = 120): string {
  if (typeof raw !== 'string') return '';
  const stripped = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
  return stripped.slice(0, maxLength);
}

/**
 * Escapes HTML entities for safe external export or rendering.
 */
export function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"'/]/g, char => HTML_ENTITY_MAP[char] || char);
}

/**
 * Sanitizes and clamps a numeric rupee amount within safe bounds.
 */
export function sanitizeCurrencyAmount(
  value: unknown,
  min = 0,
  max = 100000
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

/**
 * Sanitizes and clamps a 30-day cycle day index (1 to 30).
 */
export function sanitizeCycleDay(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return 1;
  }
  return Math.min(30, Math.max(1, Math.round(parsed)));
}

/**
 * Validates that a hydrated JSON payload from localStorage conforms to expected schema invariants.
 */
export function isValidPersistedSchema(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const obj = payload as Record<string, unknown>;
  return (
    typeof obj.currentDay === 'number' &&
    obj.currentDay >= 1 &&
    obj.currentDay <= 30 &&
    typeof obj.baseBudget === 'number' &&
    obj.baseBudget > 0 &&
    Array.isArray(obj.transactions) &&
    Array.isArray(obj.commitments) &&
    Array.isArray(obj.subscriptions) &&
    Array.isArray(obj.savingsGoals)
  );
}
