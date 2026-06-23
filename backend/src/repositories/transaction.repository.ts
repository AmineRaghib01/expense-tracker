import { prisma } from '../config/database.js';
import { Transaction, Prisma, TransactionType } from '@prisma/client';
import { paginate } from '../utils/helpers.js';
import { TransactionFilters } from '../types/index.js';

export class TransactionRepository {
  async findAll(userId: string, filters: TransactionFilters) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      search,
      type,
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = filters;

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
      ...(minAmount !== undefined || maxAmount !== undefined
        ? {
            amount: {
              ...(minAmount !== undefined && { gte: minAmount }),
              ...(maxAmount !== undefined && { lte: maxAmount }),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        ...paginate(page, limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  async findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return prisma.transaction.create({ data, include: { category: true } });
  }

  async update(id: string, data: Prisma.TransactionUpdateInput) {
    return prisma.transaction.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string): Promise<Transaction> {
    return prisma.transaction.delete({ where: { id } });
  }

  async aggregateByType(userId: string, start: Date, end: Date, type: TransactionType) {
    const result = await prisma.transaction.aggregate({
      where: { userId, type, date: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    });
    return { sum: result._sum.amount, count: result._count };
  }

  async groupByCategory(userId: string, start: Date, end: Date, type: TransactionType) {
    return prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type, date: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    });
  }

  async getRecent(userId: string, limit = 5) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getMonthlyTotals(userId: string, months: number) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return prisma.transaction.findMany({
      where: { userId, date: { gte: startDate } },
      select: { amount: true, type: true, date: true },
    });
  }
}

export const transactionRepository = new TransactionRepository();
