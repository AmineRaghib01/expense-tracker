export interface UserDTO {
  id: string;
  fullName: string;
  email: string;
  currency: string;
  theme: string;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  monthlySummary: boolean;
  financialTips: boolean;
  createdAt: Date;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  tokens: AuthTokensDTO;
}

export const toUserDTO = (user: {
  id: string;
  fullName: string;
  email: string;
  currency: string;
  theme: string;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  monthlySummary: boolean;
  financialTips: boolean;
  createdAt: Date;
}): UserDTO => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  currency: user.currency,
  theme: user.theme,
  emailNotifications: user.emailNotifications,
  budgetAlerts: user.budgetAlerts,
  monthlySummary: user.monthlySummary,
  financialTips: user.financialTips,
  createdAt: user.createdAt,
});
