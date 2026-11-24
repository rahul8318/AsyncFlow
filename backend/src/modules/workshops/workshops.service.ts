import { prisma } from '../../services/prisma.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import { emitToOrg, emitToUser } from '../../services/socket.js';
import { WorkshopStatus, NotificationType } from '@prisma/client';

export class WorkshopService {
  async listWorkshops(
    orgId: string,
    userId: string,
    query?: { status?: WorkshopStatus; timeframe?: 'upcoming' | 'past'; search?: string }
  ) {
    const where: any = { organizationId: orgId };

    if (query?.status) {
      where.status = query.status;
    } else if (query?.timeframe === 'upcoming') {
      where.scheduledAt = { gte: new Date() };
    } else if (query?.timeframe === 'past') {
      where.scheduledAt = { lt: new Date() };
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { instructorName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const workshops = await prisma.workshop.findMany({
      where,
      include: {
        registrations: {
          where: { userId },
        },
        _count: {
          select: {
            registrations: { where: { status: 'REGISTERED' } },
            attendance: true,
            feedback: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return workshops.map((w) => ({
      ...w,
      isRegistered: w.registrations.some((r) => r.status === 'REGISTERED'),
      registeredCount: w._count.registrations,
    }));
  }

  async getWorkshopDetails(orgId: string, workshopId: string, userId: string) {
    const workshop = await prisma.workshop.findFirst({
      where: { id: workshopId, organizationId: orgId },
      include: {
        instructor: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true },
        },
        registrations: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        feedback: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    const isRegistered = workshop.registrations.some(
      (r) => r.userId === userId && r.status === 'REGISTERED'
    );
    const myFeedback = workshop.feedback.find((f) => f.userId === userId) || null;

    return {
      ...workshop,
      isRegistered,
      myFeedback,
    };
  }

  async createWorkshop(
    orgId: string,
    userId: string,
    data: {
      title: string;
      description: string;
      instructorName: string;
      instructorId?: string;
      coverImage?: string;
      scheduledAt: string;
      durationMinutes: number;
      timezone?: string;
      meetingUrl?: string;
      maxAttendees?: number;
      materialsUrl?: string;
    }
  ) {
    const workshop = await prisma.workshop.create({
      data: {
        organizationId: orgId,
        title: data.title,
        description: data.description,
        instructorName: data.instructorName,
        instructorId: data.instructorId || userId,
        coverImage: data.coverImage,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes,
        timezone: data.timezone || 'UTC',
        meetingUrl: data.meetingUrl,
        maxAttendees: data.maxAttendees || 50,
        materialsUrl: data.materialsUrl,
      },
    });

    emitToOrg(orgId, 'workshop_created', {
      id: workshop.id,
      title: workshop.title,
      scheduledAt: workshop.scheduledAt,
    });

    return workshop;
  }

  async register(orgId: string, workshopId: string, userId: string) {
    const workshop = await prisma.workshop.findFirst({
      where: { id: workshopId, organizationId: orgId },
      include: {
        _count: {
          select: { registrations: { where: { status: 'REGISTERED' } } },
        },
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    if (workshop._count.registrations >= workshop.maxAttendees) {
      throw new BadRequestError('This workshop is currently at maximum capacity');
    }

    const registration = await prisma.workshopRegistration.upsert({
      where: { workshopId_userId: { workshopId, userId } },
      update: { status: 'REGISTERED', registeredAt: new Date() },
      create: {
        workshopId,
        userId,
        status: 'REGISTERED',
      },
    });

    await prisma.notification.create({
      data: {
        organizationId: orgId,
        userId,
        type: NotificationType.WORKSHOP_INVITE,
        title: 'Workshop Registration Confirmed',
        message: `You are registered for "${workshop.title}" on ${new Date(workshop.scheduledAt).toLocaleDateString()}.`,
        linkUrl: `/app/workshops/${workshop.id}`,
      },
    });

    return registration;
  }

  async cancelRegistration(orgId: string, workshopId: string, userId: string) {
    return await prisma.workshopRegistration.update({
      where: { workshopId_userId: { workshopId, userId } },
      data: { status: 'CANCELLED' },
    });
  }

  async submitFeedback(
    orgId: string,
    workshopId: string,
    userId: string,
    data: { rating: number; comment?: string }
  ) {
    const workshop = await prisma.workshop.findFirst({
      where: { id: workshopId, organizationId: orgId },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    return await prisma.workshopFeedback.upsert({
      where: { workshopId_userId: { workshopId, userId } },
      update: {
        rating: data.rating,
        comment: data.comment,
      },
      create: {
        workshopId,
        userId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }
}

export const workshopService = new WorkshopService();
