import { notificationRepository } from '../repositories/notification.repository.js';
import { NotFoundError } from '../utils/errors.js';

export class NotificationService {
  async getAll(userId: string, unreadOnly = false) {
    return notificationRepository.findAll(userId, unreadOnly);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  }

  async markAllAsRead(userId: string) {
    const count = await notificationRepository.markAllAsRead(userId);
    return { marked: count };
  }

  async delete(id: string, userId: string) {
    const deleted = await notificationRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Notification not found');
    return { deleted: true };
  }

  async createFinancialTip(userId: string) {
    const tips = [
      'Review your subscriptions monthly to eliminate unused services.',
      'Set up automatic transfers to your savings account on payday.',
      'Track small daily expenses — they add up faster than you think.',
      'Aim to save at least 20% of your monthly income.',
      'Compare prices before major purchases to maximize savings.',
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return notificationRepository.create({
      title: 'Financial Tip',
      message: tip,
      type: 'tip',
      user: { connect: { id: userId } },
    });
  }
}

export const notificationService = new NotificationService();
