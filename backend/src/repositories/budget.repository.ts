import { prisma } from '../config/database.js';
import { Budget, Prisma } from '@prisma/client';

export class BudgetRepository {
  async findAll(userId: string, month?: number, year?: number) {
    return prisma.budget.findMany({
      where: {
        userId,
        ...(month !== undefined && { month }),
        ...(year !== undefined && { year }),
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async findByMonthCategory(
    userId: string,
    month: number,
    year: number,
    categoryId: string | null,
  ) {
    return prisma.budget.findFirst({
      where: { userId, month, year, categoryId },
    });
  }

  async create(data: Prisma.BudgetCreateInput): Promise<Budget> {
    return prisma.budget.create({ data, include: { category: true } });
  }

  async update(id: string, data: Prisma.BudgetUpdateInput) {
    return prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string): Promise<Budget> {
    return prisma.budget.delete({ where: { id } });
  }
}

export const budgetRepository = new BudgetRepository();
