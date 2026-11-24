import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notifications.service.js';
import { sendSuccess } from '../../utils/response.js';

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const result = await notificationService.listUserNotifications(
        req.user!.id,
        req.organizationId,
        limit
      );
      return sendSuccess(res, result, 'Notifications fetched');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(
        req.user!.id,
        req.organizationId
      );
      return sendSuccess(res, result, 'Unread count fetched');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id, req.user!.id);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id, req.organizationId);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
