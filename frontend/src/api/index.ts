import api from './client';
import type {
  ApiResponse,
  User,
  AuthTokens,
  Transaction,
  Category,
  Budget,
  DashboardData,
  PaginatedResponse,
  Notification,
  AIInsight,
  ReportData,
} from '@/types';

export const authApi = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>('/auth/profile', data),
};

export const transactionApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params }),
  getById: (id: string) => api.get<ApiResponse<Transaction>>(`/transactions/${id}`),
  create: (data: Partial<Transaction>) => api.post<ApiResponse<Transaction>>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) =>
    api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

export const categoryApi = {
  getAll: (type?: string) =>
    api.get<ApiResponse<Category[]>>('/categories', { params: type ? { type } : {} }),
  create: (data: Partial<Category>) => api.post<ApiResponse<Category>>('/categories', data),
  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const budgetApi = {
  getAll: (month?: number, year?: number) =>
    api.get<ApiResponse<Budget[]>>('/budgets', { params: { month, year } }),
  create: (data: { amount: number; month: number; year: number; categoryId?: string | null }) =>
    api.post<ApiResponse<Budget>>('/budgets', data),
  update: (id: string, data: { amount: number }) =>
    api.put<ApiResponse<Budget>>(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

export const dashboardApi = {
  get: (month?: number, year?: number) =>
    api.get<ApiResponse<DashboardData>>('/dashboard', { params: { month, year } }),
};

export const reportApi = {
  generate: (params: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<ReportData>>('/reports', { params }),
  exportPdf: (params: Record<string, string | number | undefined>) =>
    api.get('/reports', { params: { ...params, format: 'pdf' }, responseType: 'blob' }),
  exportExcel: (params: Record<string, string | number | undefined>) =>
    api.get('/reports', { params: { ...params, format: 'excel' }, responseType: 'blob' }),
};

export const notificationApi = {
  getAll: (unreadOnly = false) =>
    api.get<ApiResponse<Notification[]>>('/notifications', { params: { unreadOnly } }),
  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const aiApi = {
  getInsights: () => api.get<ApiResponse<AIInsight[]>>('/ai/insights'),
  generateInsights: () => api.post<ApiResponse<AIInsight[]>>('/ai/insights/generate'),
  getSpendingAnalysis: () => api.get<ApiResponse<AIInsight[]>>('/ai/spending-analysis'),
  getFinancialHealth: () => api.get<ApiResponse<AIInsight>>('/ai/financial-health'),
  getForecast: () => api.get<ApiResponse<AIInsight>>('/ai/forecast'),
};
