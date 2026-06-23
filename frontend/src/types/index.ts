export interface User {
  id: string;
  fullName: string;
  email: string;
  currency: string;
  theme: string;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  monthlySummary: boolean;
  financialTips: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  notes?: string | null;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  category: Category;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId?: string | null;
  category?: Category | null;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  status: 'good' | 'warning' | 'over';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

export interface DashboardData {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    transactionCount: number;
    budgetUtilization: number;
    financialHealthScore: number;
  };
  recentTransactions: Transaction[];
  expenseBreakdown: CategoryBreakdown[];
  incomeBreakdown: CategoryBreakdown[];
  topCategories: CategoryBreakdown[];
  monthlyAnalytics: MonthlyAnalytics[];
  cashFlow: CashFlowItem[];
  budgetStatus: BudgetStatus;
  spendingTrends: { month: string; amount: number }[];
  incomeVsExpense: { month: string; income: number; expenses: number }[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  type: string;
}

export interface MonthlyAnalytics {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CashFlowItem {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface BudgetStatus {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilization: number;
  budgets: number;
  isOverBudget: boolean;
}

export interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReportData {
  title: string;
  period: { start: string; end: string };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    savingsRate: number;
    transactionCount: number;
  };
  incomeBreakdown: ReportBreakdown[];
  expenseBreakdown: ReportBreakdown[];
}

export interface ReportBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  count: number;
  type: string;
}
