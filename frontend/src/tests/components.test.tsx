import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, cn } from '../lib/utils';

describe('Frontend Utilities and Formatters', () => {
  it('cn should merge classnames cleanly', () => {
    const result = cn('px-4 py-2', 'bg-blue-600', { 'text-white': true, 'opacity-50': false });
    expect(result).toContain('px-4');
    expect(result).toContain('bg-blue-600');
    expect(result).toContain('text-white');
    expect(result).not.toContain('opacity-50');
  });

  it('formatDate should format standard ISO dates', () => {
    const dateStr = '2026-11-24T10:00:00Z';
    const formatted = formatDate(dateStr);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Nov');
  });

  it('formatDate should handle null / undefined gracefully', () => {
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('formatDateTime should format date and time', () => {
    const dateStr = '2026-11-24T10:30:00Z';
    const formatted = formatDateTime(dateStr);
    expect(formatted).toContain('2026');
  });
});
