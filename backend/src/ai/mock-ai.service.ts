import {
  AIServiceInterface,
  AIAnalysisResult,
  SpendingData,
  HealthData,
  TransactionData,
  SummaryData,
  BudgetData,
  ForecastData,
} from './ai.interface.js';

export class MockAIService implements AIServiceInterface {
  async analyzeSpending(data: SpendingData): Promise<AIAnalysisResult[]> {
    const insights: AIAnalysisResult[] = [];
    const change =
      data.previousMonthExpenses && data.previousMonthExpenses > 0
        ? ((data.totalExpenses - data.previousMonthExpenses) / data.previousMonthExpenses) * 100
        : 0;

    if (Math.abs(change) > 10) {
      const direction = change > 0 ? 'increased' : 'decreased';
      insights.push({
        title: 'Spending Trend Alert',
        content: `Your total expenses have ${direction} by ${Math.abs(change).toFixed(0)}% compared to last month. ${change > 0 ? 'Review your discretionary spending categories.' : 'Great job reducing your expenses!'}`,
        type: 'spending_analysis',
      });
    }

    for (const cat of data.categoryBreakdown.slice(0, 3)) {
      if (cat.percentage > 30) {
        insights.push({
          title: `High ${cat.name} Spending`,
          content: `${cat.name} accounts for ${cat.percentage.toFixed(0)}% of your total expenses. Consider setting a dedicated budget for this category.`,
          type: 'category_analysis',
        });
      }
    }

    const foodCat = data.categoryBreakdown.find((c) =>
      c.name.toLowerCase().includes('food'),
    );
    if (foodCat && data.previousMonthExpenses) {
      const prevFood = foodCat.amount * 0.85;
      const foodChange = ((foodCat.amount - prevFood) / prevFood) * 100;
      if (foodChange > 15) {
        insights.push({
          title: 'Dining Expense Increase',
          content: `Food expenses increased by ${foodChange.toFixed(0)}% compared to last month. Consider setting a monthly dining budget.`,
          type: 'spending_analysis',
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        title: 'Spending On Track',
        content:
          'Your spending patterns look healthy this month. Keep maintaining your current budget discipline.',
        type: 'spending_analysis',
      });
    }

    return insights;
  }

  async analyzeFinancialHealth(data: HealthData): Promise<AIAnalysisResult> {
    let content: string;
    let title: string;

    if (data.financialHealthScore >= 80) {
      title = 'Excellent Financial Health';
      content = `Your financial health score of ${data.financialHealthScore}/100 indicates strong financial management. Your savings rate of ${data.savingsRate.toFixed(1)}% is above average. Continue your current strategy.`;
    } else if (data.financialHealthScore >= 60) {
      title = 'Good Financial Health';
      content = `Your score of ${data.financialHealthScore}/100 shows solid fundamentals. Focus on increasing your savings rate (currently ${data.savingsRate.toFixed(1)}%) and keeping budget utilization under 80%.`;
    } else if (data.financialHealthScore >= 40) {
      title = 'Financial Health Needs Attention';
      content = `Your score of ${data.financialHealthScore}/100 suggests room for improvement. Expenses are ${data.budgetUtilization.toFixed(0)}% of budget. Consider reducing discretionary spending and building an emergency fund.`;
    } else {
      title = 'Critical Financial Health';
      content = `Your score of ${data.financialHealthScore}/100 requires immediate action. Create a strict budget, cut non-essential expenses, and focus on increasing income sources.`;
    }

    return { title, content, type: 'health_analysis' };
  }

  async generateCostSavingSuggestions(data: SpendingData): Promise<AIAnalysisResult[]> {
    const suggestions: AIAnalysisResult[] = [];

    if (data.totalExpenses > data.totalIncome * 0.8) {
      suggestions.push({
        title: 'Reduce Fixed Costs',
        content:
          'Your expenses exceed 80% of income. Review recurring subscriptions and negotiate better rates on utilities and insurance.',
        type: 'cost_saving',
      });
    }

    const entertainment = data.categoryBreakdown.find((c) =>
      c.name.toLowerCase().includes('entertainment'),
    );
    if (entertainment && entertainment.percentage > 15) {
      suggestions.push({
        title: 'Entertainment Budget',
        content: `Entertainment spending is ${entertainment.percentage.toFixed(0)}% of total expenses. Set a monthly cap of $${(entertainment.amount * 0.7).toFixed(0)} to save ${(entertainment.amount * 0.3).toFixed(0)} per month.`,
        type: 'cost_saving',
      });
    }

    suggestions.push({
      title: 'Automate Savings',
      content:
        'Set up automatic transfers of 10-20% of income to a separate savings account on payday.',
      type: 'cost_saving',
    });

    suggestions.push({
      title: 'Meal Planning',
      content:
        'Planning meals weekly can reduce food expenses by 20-30%. Batch cook and reduce restaurant visits.',
      type: 'cost_saving',
    });

    return suggestions;
  }

  async detectUnusualExpenses(transactions: TransactionData[]): Promise<AIAnalysisResult[]> {
    if (transactions.length < 5) return [];

    const amounts = transactions.map((t) => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length,
    );
    const threshold = mean + 2 * stdDev;

    const unusual = transactions.filter((t) => t.amount > threshold);
    return unusual.slice(0, 5).map((t) => ({
      title: 'Unusual Expense Detected',
      content: `A ${t.category} expense of $${t.amount.toFixed(2)} on ${new Date(t.date).toLocaleDateString()} (${t.description}) is significantly higher than your average of $${mean.toFixed(2)}.`,
      type: 'anomaly_detection',
    }));
  }

  async generateMonthlySummary(data: SummaryData): Promise<AIAnalysisResult> {
    const savingsRate =
      data.totalIncome > 0
        ? ((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100
        : 0;
    const topCat = data.topCategories[0];

    return {
      title: `${data.month} Financial Summary`,
      content: `In ${data.month}, you earned $${data.totalIncome.toFixed(2)} and spent $${data.totalExpenses.toFixed(2)}, resulting in a ${data.netProfit >= 0 ? 'profit' : 'loss'} of $${Math.abs(data.netProfit).toFixed(2)}. Your savings rate was ${savingsRate.toFixed(1)}%. ${topCat ? `Your top spending category was ${topCat.name} at $${topCat.amount.toFixed(2)}.` : ''} ${data.netProfit >= 0 ? 'Keep up the great work!' : 'Focus on reducing expenses next month.'}`,
      type: 'monthly_summary',
    };
  }

  async generateRecommendations(data: HealthData): Promise<AIAnalysisResult[]> {
    const recs: AIAnalysisResult[] = [];

    if (data.savingsRate < 20) {
      recs.push({
        title: 'Increase Savings Rate',
        content: `Your current savings rate is ${data.savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income. Start with an extra 5% this month.`,
        type: 'recommendation',
      });
    }

    if (data.budgetUtilization > 90) {
      recs.push({
        title: 'Budget Optimization',
        content:
          'You are near your budget limit. Prioritize essential expenses and defer discretionary purchases to next month.',
        type: 'recommendation',
      });
    }

    recs.push({
      title: 'Emergency Fund',
      content:
        'Ensure you have 3-6 months of expenses saved in an easily accessible emergency fund.',
      type: 'recommendation',
    });

    return recs;
  }

  async generateBudgetRecommendations(data: BudgetData): Promise<AIAnalysisResult[]> {
    return data.budgets
      .filter((b) => b.percentage > 80)
      .map((b) => ({
        title: `Budget Adjustment: ${b.category}`,
        content:
          b.percentage > 100
            ? `You've exceeded your ${b.category} budget by ${(b.percentage - 100).toFixed(0)}%. Consider increasing the budget to $${(b.spent * 1.1).toFixed(0)} or cutting spending.`
            : `Your ${b.category} budget is ${b.percentage.toFixed(0)}% utilized. Monitor closely to avoid overspending.`,
        type: 'budget_recommendation',
      }));
  }

  async forecastExpenses(data: ForecastData): Promise<AIAnalysisResult> {
    const expenses = data.historicalExpenses;
    if (expenses.length === 0) {
      return {
        title: 'Expense Forecast',
        content: 'Insufficient data for forecasting. Add more transactions to enable predictions.',
        type: 'forecast',
      };
    }

    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const trend =
      expenses.length >= 2
        ? ((expenses[expenses.length - 1] - expenses[0]) / expenses[0]) * 100
        : 0;
    const forecast = avg * (1 + trend / 100 / expenses.length);

    return {
      title: 'Expense Forecast',
      content: `Based on ${expenses.length} months of data, your average monthly expenses are $${avg.toFixed(2)}. Next month is projected at approximately $${forecast.toFixed(2)} (${trend > 0 ? 'upward' : 'downward'} trend of ${Math.abs(trend).toFixed(1)}%).`,
      type: 'forecast',
    };
  }
}

export const mockAIService = new MockAIService();
