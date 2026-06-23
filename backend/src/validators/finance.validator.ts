import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().min(1).max(50).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(200),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  notes: z.string().max(500).optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export const createBudgetSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  categoryId: z.string().nullable().optional(),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export const reportQuerySchema = z.object({
  type: z.enum(['monthly', 'quarterly', 'yearly', 'category', 'cashflow', 'expense', 'income']),
  month: z.coerce.number().int().min(1).max(12).optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  categoryId: z.string().optional(),
  format: z.enum(['json', 'pdf', 'excel']).optional(),
});

export const dashboardQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});
