import { Request } from 'express';
import { prisma } from '../services/prisma.js';

export const logActivity = async (
  req: Request,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: any
) => {
  try {
    const organizationId = req.organizationId;
    if (!organizationId) return;

    await prisma.activityLog.create({
      data: {
        organizationId,
        userId: req.user?.id,
        action,
        entityType,
        entityId,
        metadata: metadata || {},
        ipAddress: req.ip || req.socket.remoteAddress,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};
