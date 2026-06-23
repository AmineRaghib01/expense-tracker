import { transactionRepository } from '../repositories/transaction.repository.js';
import { budgetRepository } from '../repositories/budget.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import {
  getMonthRange,
  toNumber,
} from '../utils/helpers.js';
import {
  DashboardStats,
  CategoryBreakdown,
  MonthlyAnalytics,
} from '../types/index.js';

export class DashboardService {
  async getDashboard(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const { start, end } = getMonthRange(m, y);

    const [incomeAgg, expenseAgg, recentTransactions, budgets] =
      await Promise.all([
        transactionRepository.aggregateByType(userId, start, end, 'INCOME'),
        transactionRepository.aggregateByType(userId, start, end, 'EXPENSE'),
        transactionRepository.getRecent(userId, 8),
        budgetRepository.findAll(userId, m, y),
      ]);

    const totalIncome = toNumber(incomeAgg.sum ?? 0);
    const totalExpenses = toNumber(expenseAgg.sum ?? 0);
    const netProfit = totalIncome - totalExpenses;

    const expenseBreakdown = await this.getCategoryBreakdown(
      userId,
      start,
      end,
      'EXPENSE',
      totalExpenses,
    );
    const incomeBreakdown = await this.getCategoryBreakdown(
      userId,
      start,
      end,
      'INCOME',
      totalIncome,
    );

    const monthlyAnalytics = await this.getMonthlyAnalytics(userId, 6);
    const cashFlow = monthlyAnalytics.map((ma) => ({
      month: ma.month,
      income: ma.income,
      expenses: ma.expenses,
      net: ma.net,
    }));

    const budgetStatus = await this.getBudgetStatus(userId, m, y, budgets);
    const financialHealthScore = this.calculateHealthScore(
      totalIncome,
      totalExpenses,
      budgetStatus.utilization,
    );

    const stats: DashboardStats = {
      totalIncome,
      totalExpenses,
      netProfit,
      transactionCount: incomeAgg.count + expenseAgg.count,
      budgetUtilization: budgetStatus.utilization,
      financialHealthScore,
    };

    return {
      stats,
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: toNumber(t.amount),
      })),
      expenseBreakdown,
      incomeBreakdown,
      topCategories: expenseBreakdown.slice(0, 5),
      monthlyAnalytics,
      cashFlow,
      budgetStatus,
      spendingTrends: monthlyAnalytics.map((ma) => ({
        month: ma.month,
        amount: ma.expenses,
      })),
      incomeVsExpense: monthlyAnalytics.map((ma) => ({
        month: ma.month,
        income: ma.income,
        expenses: ma.expenses,
      })),
    };
  }

  private async getCategoryBreakdown(
    userId: string,
    start: Date,
    end: Date,
    type: 'INCOME' | 'EXPENSE',
    total: number,
  ): Promise<CategoryBreakdown[]> {
    const grouped = await transactionRepository.groupByCategory(userId, start, end, type);
    const categories = await categoryRepository.findAll(userId, type);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return grouped
      .map((g) => {
        const cat = categoryMap.get(g.categoryId);
        const amount = toNumber(g._sum.amount ?? 0);
        return {
          categoryId: g.categoryId,
          categoryName: cat?.name ?? 'Unknown',
          color: cat?.color ?? '#6366f1',
          icon: cat?.icon ?? 'circle',
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          type,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  private async getMonthlyAnalytics(userId: string, months: number): Promise<MonthlyAnalytics[]> {
    const transactions = await transactionRepository.getMonthlyTotals(userId, months);
    const monthMap = new Map<string, { income: number; expenses: number }>();

    for (const tx of transactions) {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };
      const amount = toNumber(tx.amount);
      if (tx.type === 'INCOME') existing.income += amount;
      else existing.expenses += amount;
      monthMap.set(key, existing);
    }

    const result: MonthlyAnalytics[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const data = monthMap.get(key) ?? { income: 0, expenses: 0 };
      result.push({
        month: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      });
    }
    return result;
  }

  private async getBudgetStatus(
    userId: string,
    month: number,
    year: number,
    budgets: Awaited<ReturnType<typeof budgetRepository.findAll>>,
  ) {
    const { start, end } = getMonthRange(month, year);
    const expenseAgg = await transactionRepository.aggregateByType(
      userId,
      start,
      end,
      'EXPENSE',
    );
    const totalSpent = toNumber(expenseAgg.sum ?? 0);
    const totalBudget = budgets.reduce((sum, b) => sum + toNumber(b.amount), 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remaining: Math.max(0, totalBudget - totalSpent),
      utilization: Math.min(100, utilization),
      budgets: budgets.length,
      isOverBudget: totalSpent > totalBudget && totalBudget > 0,
    };
  }

  private calculateHealthScore(
    income: number,
    expenses: number,
    budgetUtilization: number,
  ): number {
    let score = 50;

    if (income > 0) {
      const savingsRate = (income - expenses) / income;
      score += savingsRate * 30;
    }

    if (expenses === 0 && income > 0) score += 20;
    if (budgetUtilization <= 80) score += 10;
    if (budgetUtilization > 100) score -= 15;
    if (income > expenses) score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export const dashboardService = new DashboardService();
