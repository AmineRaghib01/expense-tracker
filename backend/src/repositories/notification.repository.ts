import { prisma } from '../config/database.js';
import { Notification, Prisma } from '@prisma/client';

export class NotificationRepository {
  async findAll(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly && { isRead: false }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) return null;
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) return false;
    await prisma.notification.delete({ where: { id } });
    return true;
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}

export const notificationRepository = new NotificationRepository();
