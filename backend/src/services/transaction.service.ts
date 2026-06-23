import { transactionRepository } from '../repositories/transaction.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { paginationMeta } from '../utils/helpers.js';
import { TransactionFilters } from '../types/index.js';
import { TransactionType } from '@prisma/client';

export class TransactionService {
  async getAll(userId: string, filters: TransactionFilters) {
    const { transactions, total } = await transactionRepository.findAll(userId, filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    return {
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      pagination: paginationMeta(total, page, limit),
    };
  }

  async getById(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) throw new NotFoundError('Transaction not found');
    return { ...transaction, amount: Number(transaction.amount) };
  }

  async create(
    userId: string,
    data: {
      amount: number;
      description: string;
      date: string;
      notes?: string;
      type: TransactionType;
      categoryId: string;
    },
  ) {
    const category = await categoryRepository.findById(data.categoryId, userId);
    if (!category) throw new NotFoundError('Category not found');
    if (category.type !== data.type) {
      throw new ValidationError('Category type does not match transaction type');
    }

    const transaction = await transactionRepository.create({
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      notes: data.notes,
      type: data.type,
      category: { connect: { id: data.categoryId } },
      user: { connect: { id: userId } },
    });

    return { ...transaction, amount: Number(transaction.amount) };
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{
      amount: number;
      description: string;
      date: string;
      notes: string;
      type: TransactionType;
      categoryId: string;
    }>,
  ) {
    await this.getById(id, userId);

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId, userId);
      if (!category) throw new NotFoundError('Category not found');
      const type = data.type ?? (await this.getById(id, userId)).type;
      if (category.type !== type) {
        throw new ValidationError('Category type does not match transaction type');
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    const transaction = await transactionRepository.update(id, updateData);
    return { ...transaction, amount: Number(transaction.amount) };
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return transactionRepository.delete(id);
  }
}

export const transactionService = new TransactionService();
