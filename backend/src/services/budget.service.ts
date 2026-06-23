import { budgetRepository } from '../repositories/budget.repository.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { getMonthRange, toNumber } from '../utils/helpers.js';

export class BudgetService {
  async getAll(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    const budgets = await budgetRepository.findAll(userId, m, y);
    const { start, end } = getMonthRange(m, y);

    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const spent = budget.categoryId
          ? await transactionRepository.aggregateByType(userId, start, end, 'EXPENSE')
          : await transactionRepository.aggregateByType(userId, start, end, 'EXPENSE');

        let categorySpent = toNumber(spent.sum ?? 0);
        if (budget.categoryId) {
          const grouped = await transactionRepository.groupByCategory(
            userId,
            start,
            end,
            'EXPENSE',
          );
          const catGroup = grouped.find((g) => g.categoryId === budget.categoryId);
          categorySpent = toNumber(catGroup?._sum.amount ?? 0);
        }

        const budgetAmount = toNumber(budget.amount);
        const percentage = budgetAmount > 0 ? (categorySpent / budgetAmount) * 100 : 0;
        const isOverBudget = categorySpent > budgetAmount;

        return {
          ...budget,
          amount: budgetAmount,
          spent: budget.categoryId ? categorySpent : categorySpent,
          remaining: Math.max(0, budgetAmount - categorySpent),
          percentage: Math.min(100, percentage),
          isOverBudget,
          status: isOverBudget ? 'over' : percentage >= 80 ? 'warning' : 'good',
        };
      }),
    );

    return enriched;
  }

  async getById(id: string, userId: string) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw new NotFoundError('Budget not found');
    return { ...budget, amount: toNumber(budget.amount) };
  }

  async create(
    userId: string,
    data: { amount: number; month: number; year: number; categoryId?: string | null },
  ) {
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId, userId);
      if (!category) throw new NotFoundError('Category not found');
    }

    const existing = await budgetRepository.findByMonthCategory(
      userId,
      data.month,
      data.year,
      data.categoryId ?? null,
    );
    if (existing) throw new ConflictError('Budget already exists for this period');

    return budgetRepository.create({
      amount: data.amount,
      month: data.month,
      year: data.year,
      ...(data.categoryId
        ? { category: { connect: { id: data.categoryId } } }
        : { categoryId: null }),
      user: { connect: { id: userId } },
    });
  }

  async update(id: string, userId: string, data: { amount: number }) {
    await this.getById(id, userId);
    return budgetRepository.update(id, { amount: data.amount });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return budgetRepository.delete(id);
  }

  async checkBudgetAlerts(userId: string): Promise<void> {
    const budgets = await this.getAll(userId);
    for (const budget of budgets) {
      if (budget.isOverBudget) {
        await notificationRepository.create({
          title: 'Budget Exceeded',
          message: `You've exceeded your ${budget.category?.name ?? 'monthly'} budget by ${((budget.spent / budget.amount - 1) * 100).toFixed(0)}%`,
          type: 'budget_alert',
          user: { connect: { id: userId } },
        });
      } else if (budget.status === 'warning') {
        await notificationRepository.create({
          title: 'Budget Warning',
          message: `You've used ${budget.percentage.toFixed(0)}% of your ${budget.category?.name ?? 'monthly'} budget`,
          type: 'budget_warning',
          user: { connect: { id: userId } },
        });
      }
    }
  }
}

export const budgetService = new BudgetService();
