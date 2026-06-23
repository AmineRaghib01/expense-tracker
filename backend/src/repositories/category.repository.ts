import { prisma } from '../config/database.js';
import { Category, Prisma, CategoryType } from '@prisma/client';

export class CategoryRepository {
  async findAll(userId: string, type?: CategoryType): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId, ...(type && { type }) },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { id, userId } });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }

  async countTransactions(categoryId: string): Promise<number> {
    return prisma.transaction.count({ where: { categoryId } });
  }
}

export const categoryRepository = new CategoryRepository();
