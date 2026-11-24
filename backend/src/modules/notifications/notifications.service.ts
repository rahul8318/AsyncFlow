import { prisma } from '../../services/prisma.js';

export class NotificationService {
  async listUserNotifications(userId: string, orgId?: string, limit = 20) {
    const where: any = { userId };
    if (orgId) where.organizationId = orgId;

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string, orgId?: string) {
    const where: any = { userId, isRead: false };
    if (orgId) where.organizationId = orgId;

    const count = await prisma.notification.count({ where });
    return { unreadCount: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, orgId?: string) {
    const where: any = { userId, isRead: false };
    if (orgId) where.organizationId = orgId;

    return await prisma.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
