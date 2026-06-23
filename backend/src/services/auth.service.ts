import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashResetToken,
} from '../utils/jwt.js';
import { toUserDTO, AuthResponseDTO } from '../dto/auth.dto.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { CategoryType } from '@prisma/client';

const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'INCOME' as CategoryType, color: '#10b981', icon: 'briefcase' },
  { name: 'Freelance', type: 'INCOME' as CategoryType, color: '#06b6d4', icon: 'laptop' },
  { name: 'Investment', type: 'INCOME' as CategoryType, color: '#8b5cf6', icon: 'trending-up' },
  { name: 'Business', type: 'INCOME' as CategoryType, color: '#f59e0b', icon: 'building' },
  { name: 'Food', type: 'EXPENSE' as CategoryType, color: '#ef4444', icon: 'utensils' },
  { name: 'Transportation', type: 'EXPENSE' as CategoryType, color: '#3b82f6', icon: 'car' },
  { name: 'Utilities', type: 'EXPENSE' as CategoryType, color: '#6366f1', icon: 'zap' },
  { name: 'Entertainment', type: 'EXPENSE' as CategoryType, color: '#ec4899', icon: 'film' },
  { name: 'Healthcare', type: 'EXPENSE' as CategoryType, color: '#14b8a6', icon: 'heart-pulse' },
  { name: 'Education', type: 'EXPENSE' as CategoryType, color: '#a855f7', icon: 'graduation-cap' },
  { name: 'Rent', type: 'EXPENSE' as CategoryType, color: '#f97316', icon: 'home' },
];

export class AuthService {
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateTokens(userId: string, email: string) {
    const payload = { userId, email };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  private async seedDefaultCategories(userId: string): Promise<void> {
    for (const cat of DEFAULT_CATEGORIES) {
      await categoryRepository.create({
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        user: { connect: { id: userId } },
      });
    }
  }

  async register(fullName: string, email: string, password: string): Promise<AuthResponseDTO> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await this.hashPassword(password);
    const user = await userRepository.create({
      fullName,
      email,
      password: hashedPassword,
    });

    await this.seedDefaultCategories(user.id);

    const tokens = this.generateTokens(user.id, user.email);
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: toUserDTO(user), tokens };
  }

  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await this.comparePassword(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const tokens = this.generateTokens(user.id, user.email);
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: toUserDTO(user), tokens };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      const user = await userRepository.findById(payload.userId);
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const tokens = this.generateTokens(user.id, user.email);
      await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const { token, hash, expires } = generateResetToken();
    await userRepository.update(user.id, { resetToken: hash, resetTokenExp: expires });

    logger.info(`Password reset requested for ${email}`);
    logger.info(`Reset link: ${env.FRONTEND_URL}/reset-password?token=${token}`);

    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken: env.NODE_ENV === 'development' ? token : undefined,
    };
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const hash = hashResetToken(token);
    const user = await userRepository.findByResetToken(hash);
    if (!user) throw new ValidationError('Invalid or expired reset token');

    const hashedPassword = await this.hashPassword(password);
    await userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const valid = await this.comparePassword(currentPassword, user.password);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const hashedPassword = await this.hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedPassword });
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return toUserDTO(user);
  }

  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      currency?: string;
      theme?: string;
      emailNotifications?: boolean;
      budgetAlerts?: boolean;
      monthlySummary?: boolean;
      financialTips?: boolean;
    },
  ) {
    const user = await userRepository.update(userId, data);
    return toUserDTO(user);
  }
}

export const authService = new AuthService();
