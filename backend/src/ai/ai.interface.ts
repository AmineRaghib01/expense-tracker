/**
 * AI Service Interface - designed for future OpenAI integration.
 * Replace MockAIService with OpenAIService when ready.
 */
export interface AIAnalysisResult {
  title: string;
  content: string;
  type: string;
}

export interface AIServiceInterface {
  analyzeSpending(data: SpendingData): Promise<AIAnalysisResult[]>;
  analyzeFinancialHealth(data: HealthData): Promise<AIAnalysisResult>;
  generateCostSavingSuggestions(data: SpendingData): Promise<AIAnalysisResult[]>;
  detectUnusualExpenses(transactions: TransactionData[]): Promise<AIAnalysisResult[]>;
  generateMonthlySummary(data: SummaryData): Promise<AIAnalysisResult>;
  generateRecommendations(data: HealthData): Promise<AIAnalysisResult[]>;
  generateBudgetRecommendations(data: BudgetData): Promise<AIAnalysisResult[]>;
  forecastExpenses(data: ForecastData): Promise<AIAnalysisResult>;
}

export interface SpendingData {
  totalExpenses: number;
  totalIncome: number;
  categoryBreakdown: { name: string; amount: number; percentage: number }[];
  previousMonthExpenses?: number;
}

export interface HealthData {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  budgetUtilization: number;
  financialHealthScore: number;
}

export interface TransactionData {
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export interface SummaryData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  topCategories: { name: string; amount: number }[];
}

export interface BudgetData {
  budgets: { category: string; amount: number; spent: number; percentage: number }[];
}

export interface ForecastData {
  historicalExpenses: number[];
  months: string[];
}
