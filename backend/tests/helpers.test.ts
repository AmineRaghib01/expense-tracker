import { describe, it, expect } from 'vitest';
import { formatCurrency, getMonthRange, paginationMeta } from '../src/utils/helpers.js';

describe('Helpers', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('calculates month range', () => {
    const { start, end } = getMonthRange(6, 2024);
    expect(start.getMonth()).toBe(5);
    expect(end.getMonth()).toBe(5);
    expect(end.getDate()).toBe(30);
  });

  it('calculates pagination meta', () => {
    const meta = paginationMeta(100, 2, 10);
    expect(meta.totalPages).toBe(10);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(true);
  });
});

describe('AppError', () => {
  it('creates error with status code', async () => {
    const { AppError, NotFoundError } = await import('../src/utils/errors.js');
    const error = new NotFoundError('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
    expect(error).toBeInstanceOf(AppError);
  });
});
