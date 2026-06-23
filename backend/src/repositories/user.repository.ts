import { prisma } from '../config/database.js';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({ where: { id }, data: { refreshToken } });
  }

  async findByResetToken(hash: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { resetToken: hash, resetTokenExp: { gt: new Date() } },
    });
  }
}

export const userRepository = new UserRepository();
