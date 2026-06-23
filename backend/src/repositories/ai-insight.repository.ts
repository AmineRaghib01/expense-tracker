import { prisma } from '../config/database.js';
import { AIInsight, Prisma } from '@prisma/client';

export class AIInsightRepository {
  async findAll(userId: string, limit = 20) {
    return prisma.aIInsight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(data: Prisma.AIInsightCreateInput): Promise<AIInsight> {
    return prisma.aIInsight.create({ data });
  }

  async createMany(data: Prisma.AIInsightCreateManyInput[]) {
    return prisma.aIInsight.createMany({ data });
  }

  async deleteOld(userId: string, keepCount = 50) {
    const insights = await prisma.aIInsight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: keepCount,
      select: { id: true },
    });
    if (insights.length > 0) {
      await prisma.aIInsight.deleteMany({
        where: { id: { in: insights.map((i) => i.id) } },
      });
    }
  }
}

export const aiInsightRepository = new AIInsightRepository();
