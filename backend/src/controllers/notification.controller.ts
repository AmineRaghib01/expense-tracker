import { Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, successResponse } from '../utils/response.js';

export class NotificationController {
  getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.getAll(req.user!.userId, unreadOnly);
    successResponse(res, notifications);
  });

  getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    successResponse(res, { count });
  });

  markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const notification = await notificationService.markAsRead(String(req.params.id), req.user!.userId);
    successResponse(res, notification);
  });

  markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    successResponse(res, result);
  });

  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await notificationService.delete(String(req.params.id), req.user!.userId);
    successResponse(res, null, 'Notification deleted');
  });
}

export const notificationController = new NotificationController();
