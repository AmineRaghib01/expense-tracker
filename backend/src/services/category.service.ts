import { categoryRepository } from '../repositories/category.repository.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { CategoryType } from '@prisma/client';

export class CategoryService {
  async getAll(userId: string, type?: CategoryType) {
    const categories = await categoryRepository.findAll(userId, type);
    return categories.map((cat) => ({
      ...cat,
      amount: 0,
    }));
  }

  async getById(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async create(
    userId: string,
    data: { name: string; type: CategoryType; color?: string; icon?: string },
  ) {
    try {
      return await categoryRepository.create({
        name: data.name,
        type: data.type,
        color: data.color ?? '#6366f1',
        icon: data.icon ?? 'circle',
        user: { connect: { id: userId } },
      });
    } catch {
      throw new ConflictError('Category with this name already exists');
    }
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; type?: CategoryType; color?: string; icon?: string },
  ) {
    await this.getById(id, userId);
    try {
      return await categoryRepository.update(id, data);
    } catch {
      throw new ConflictError('Category with this name already exists');
    }
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    const txCount = await categoryRepository.countTransactions(id);
    if (txCount > 0) {
      throw new ValidationError('Cannot delete category with existing transactions');
    }
    return categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
