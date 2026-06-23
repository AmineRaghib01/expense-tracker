import { dashboardService } from './dashboard.service.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import { budgetService } from './budget.service.js';
import { aiInsightRepository } from '../repositories/ai-insight.repository.js';
import { mockAIService } from '../ai/mock-ai.service.js';
import { getMonthRange, toNumber } from '../utils/helpers.js';

export class AIService {
  async generateInsights(userId: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const dashboard = await dashboardService.getDashboard(userId, month, year);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevDashboard = await dashboardService.getDashboard(userId, prevMonth, prevYear);

    const { start, end } = getMonthRange(month, year);
    const { transactions } = await transactionRepository.findAll(userId, {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      type: 'EXPENSE',
      limit: 100,
    });

    const budgets = await budgetService.getAll(userId, month, year);

    const spendingData = {
      totalExpenses: dashboard.stats.totalExpenses,
      totalIncome: dashboard.stats.totalIncome,
      categoryBreakdown: dashboard.expenseBreakdown.map((c) => ({
        name: c.categoryName,
        amount: c.amount,
        percentage: c.percentage,
      })),
      previousMonthExpenses: prevDashboard.stats.totalExpenses,
    };

    const healthData = {
      totalIncome: dashboard.stats.totalIncome,
      totalExpenses: dashboard.stats.totalExpenses,
      savingsRate:
        dashboard.stats.totalIncome > 0
          ? ((dashboard.stats.totalIncome - dashboard.stats.totalExpenses) /
              dashboard.stats.totalIncome) *
            100
          : 0,
      budgetUtilization: dashboard.stats.budgetUtilization,
      financialHealthScore: dashboard.stats.financialHealthScore,
    };

    const [
      spendingInsights,
      healthAnalysis,
      costSavings,
      unusual,
      summary,
      recommendations,
      budgetRecs,
      forecast,
    ] = await Promise.all([
      mockAIService.analyzeSpending(spendingData),
      mockAIService.analyzeFinancialHealth(healthData),
      mockAIService.generateCostSavingSuggestions(spendingData),
      mockAIService.detectUnusualExpenses(
        transactions.map((t) => ({
          description: t.description,
          amount: toNumber(t.amount),
          category: t.category.name,
          date: t.date,
        })),
      ),
      mockAIService.generateMonthlySummary({
        month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        totalIncome: dashboard.stats.totalIncome,
        totalExpenses: dashboard.stats.totalExpenses,
        netProfit: dashboard.stats.netProfit,
        topCategories: dashboard.topCategories.map((c) => ({
          name: c.categoryName,
          amount: c.amount,
        })),
      }),
      mockAIService.generateRecommendations(healthData),
      mockAIService.generateBudgetRecommendations({
        budgets: budgets.map((b) => ({
          category: b.category?.name ?? 'Overall',
          amount: b.amount,
          spent: b.spent,
          percentage: b.percentage,
        })),
      }),
      mockAIService.forecastExpenses({
        historicalExpenses: dashboard.monthlyAnalytics.map((m) => m.expenses),
        months: dashboard.monthlyAnalytics.map((m) => m.month),
      }),
    ]);

    const allInsights = [
      healthAnalysis,
      summary,
      forecast,
      ...spendingInsights,
      ...costSavings,
      ...unusual,
      ...recommendations,
      ...budgetRecs,
    ];

    await aiInsightRepository.createMany(
      allInsights.map((insight) => ({
        title: insight.title,
        content: insight.content,
        type: insight.type,
        userId,
      })),
    );

    await aiInsightRepository.deleteOld(userId);

    return allInsights;
  }

  async getInsights(userId: string, limit = 20) {
    return aiInsightRepository.findAll(userId, limit);
  }

  async getSpendingAnalysis(userId: string) {
    const dashboard = await dashboardService.getDashboard(userId);
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevDashboard = await dashboardService.getDashboard(
      userId,
      prevMonth.getMonth() + 1,
      prevMonth.getFullYear(),
    );

    return mockAIService.analyzeSpending({
      totalExpenses: dashboard.stats.totalExpenses,
      totalIncome: dashboard.stats.totalIncome,
      categoryBreakdown: dashboard.expenseBreakdown.map((c) => ({
        name: c.categoryName,
        amount: c.amount,
        percentage: c.percentage,
      })),
      previousMonthExpenses: prevDashboard.stats.totalExpenses,
    });
  }

  async getFinancialHealth(userId: string) {
    const dashboard = await dashboardService.getDashboard(userId);
    return mockAIService.analyzeFinancialHealth({
      totalIncome: dashboard.stats.totalIncome,
      totalExpenses: dashboard.stats.totalExpenses,
      savingsRate:
        dashboard.stats.totalIncome > 0
          ? ((dashboard.stats.totalIncome - dashboard.stats.totalExpenses) /
              dashboard.stats.totalIncome) *
            100
          : 0,
      budgetUtilization: dashboard.stats.budgetUtilization,
      financialHealthScore: dashboard.stats.financialHealthScore,
    });
  }

  async getForecast(userId: string) {
    const dashboard = await dashboardService.getDashboard(userId);
    return mockAIService.forecastExpenses({
      historicalExpenses: dashboard.monthlyAnalytics.map((m) => m.expenses),
      months: dashboard.monthlyAnalytics.map((m) => m.month),
    });
  }
}

export const aiService = new AIService();
