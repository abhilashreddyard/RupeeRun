import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces rapidly changing values (such as search inputs or sliders)
 * to improve runtime efficiency and prevent layout thrashing.
 *
 * @param value The value to debounce
 * @param delayMs Debounce delay in milliseconds (default 150ms)
 */
export function useDebounce<T>(value: T, delayMs = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
