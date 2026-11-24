import { prisma } from '../../services/prisma.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { emitToOrg, emitToUser } from '../../services/socket.js';
import { SOPCategory, Priority, SOPStatus, NotificationType } from '@prisma/client';

export class SOPService {
  async listSOPs(
    orgId: string,
    userId: string,
    query?: {
      category?: SOPCategory;
      status?: SOPStatus;
      priority?: Priority;
      search?: string;
      assignedToMe?: boolean;
    }
  ) {
    const where: any = { organizationId: orgId };

    if (query?.category) where.category = query.category;
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.assignedToMe) {
      where.assignments = {
        some: {
          OR: [{ userId }, { team: { members: { some: { userId } } } }],
        },
      };
    }

    const sops = await prisma.sOP.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        assignments: {
          include: {
            team: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        acknowledgements: {
          where: { userId },
          select: { id: true, acknowledgedAt: true, sopVersionId: true },
        },
        _count: {
          select: {
            acknowledgements: true,
            comments: true,
            versions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sops.map((sop) => ({
      ...sop,
      isAcknowledgedByMe: sop.acknowledgements.length > 0,
      myAcknowledgement: sop.acknowledgements[0] || null,
    }));
  }

  async getSOPById(orgId: string, sopId: string, userId: string) {
    const sop = await prisma.sOP.findFirst({
      where: { id: sopId, organizationId: orgId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        assignments: {
          include: {
            team: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        acknowledgements: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true },
            },
          },
          orderBy: { acknowledgedAt: 'desc' },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sop) {
      throw new NotFoundError('SOP not found');
    }

    const currentVersion =
      sop.versions.find((v) => v.versionNumber === sop.currentVersionNumber) ||
      sop.versions[0];

    const myAcknowledgement = sop.acknowledgements.find(
      (a) => a.userId === userId && a.sopVersionId === currentVersion?.id
    );

    return {
      ...sop,
      currentVersion,
      isAcknowledgedByMe: !!myAcknowledgement,
      myAcknowledgement: myAcknowledgement || null,
    };
  }

  async createSOP(
    orgId: string,
    userId: string,
    data: {
      title: string;
      summary: string;
      category: SOPCategory;
      priority: Priority;
      content: string;
      checklist?: any;
      status?: SOPStatus;
    }
  ) {
    const status = data.status || SOPStatus.PUBLISHED;

    return await prisma.$transaction(async (tx) => {
      const sop = await tx.sOP.create({
        data: {
          organizationId: orgId,
          title: data.title,
          summary: data.summary,
          category: data.category,
          priority: data.priority,
          status,
          currentVersionNumber: 1,
          createdById: userId,
          publishedAt: status === SOPStatus.PUBLISHED ? new Date() : null,
          versions: {
            create: {
              versionNumber: 1,
              title: data.title,
              content: data.content,
              changelog: 'Initial version creation.',
              checklist: data.checklist || [],
              createdById: userId,
            },
          },
        },
        include: {
          versions: true,
        },
      });

      if (status === SOPStatus.PUBLISHED) {
        emitToOrg(orgId, 'sop_published', {
          id: sop.id,
          title: sop.title,
          category: sop.category,
        });
      }

      return sop;
    });
  }

  async updateSOP(
    orgId: string,
    sopId: string,
    userId: string,
    data: {
      title?: string;
      summary?: string;
      category?: SOPCategory;
      priority?: Priority;
      status?: SOPStatus;
      content?: string;
      changelog?: string;
      checklist?: any;
      createNewVersion?: boolean;
    }
  ) {
    const existing = await prisma.sOP.findFirst({
      where: { id: sopId, organizationId: orgId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    });

    if (!existing) {
      throw new NotFoundError('SOP not found');
    }

    return await prisma.$transaction(async (tx) => {
      let currentVersionNumber = existing.currentVersionNumber;

      if (data.createNewVersion && data.content) {
        currentVersionNumber += 1;
        await tx.sOPVersion.create({
          data: {
            sopId: existing.id,
            versionNumber: currentVersionNumber,
            title: data.title || existing.title,
            content: data.content,
            changelog: data.changelog || `Updated to version ${currentVersionNumber}`,
            checklist: data.checklist || existing.versions[0]?.checklist || [],
            createdById: userId,
          },
        });
      } else if (data.content && existing.versions.length > 0) {
        // Update the current version in place
        await tx.sOPVersion.update({
          where: { id: existing.versions[0].id },
          data: {
            title: data.title || existing.versions[0].title,
            content: data.content,
            changelog: data.changelog || existing.versions[0].changelog,
            checklist: data.checklist !== undefined ? data.checklist : existing.versions[0].checklist,
          },
        });
      }

      const updatedSop = await tx.sOP.update({
        where: { id: sopId },
        data: {
          title: data.title,
          summary: data.summary,
          category: data.category,
          priority: data.priority,
          status: data.status,
          currentVersionNumber,
          publishedAt:
            data.status === SOPStatus.PUBLISHED && !existing.publishedAt
              ? new Date()
              : undefined,
        },
        include: {
          versions: { orderBy: { versionNumber: 'desc' } },
        },
      });

      return updatedSop;
    });
  }

  async assignSOP(
    orgId: string,
    sopId: string,
    assignedById: string,
    data: { teamId?: string; userId?: string; dueDate?: string }
  ) {
    const sop = await prisma.sOP.findFirst({
      where: { id: sopId, organizationId: orgId },
    });

    if (!sop) {
      throw new NotFoundError('SOP not found');
    }

    const assignment = await prisma.sOPAssignment.create({
      data: {
        sopId,
        organizationId: orgId,
        teamId: data.teamId,
        userId: data.userId,
        assignedById,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: {
        team: true,
        user: true,
      },
    });

    // Create notifications for assigned individuals
    if (data.userId) {
      await prisma.notification.create({
        data: {
          organizationId: orgId,
          userId: data.userId,
          type: NotificationType.SOP_ASSIGNED,
          title: 'SOP Assigned',
          message: `You have been assigned to read and acknowledge "${sop.title}".`,
          linkUrl: `/app/sops/${sop.id}`,
        },
      });
      emitToUser(data.userId, 'notification', {
        title: 'SOP Assigned',
        message: `You have been assigned to read "${sop.title}".`,
      });
    } else if (data.teamId) {
      const teamMembers = await prisma.organizationMember.findMany({
        where: { organizationId: orgId, teamId: data.teamId },
        select: { userId: true },
      });

      for (const tm of teamMembers) {
        await prisma.notification.create({
          data: {
            organizationId: orgId,
            userId: tm.userId,
            type: NotificationType.SOP_ASSIGNED,
            title: 'Team SOP Assigned',
            message: `Your team was assigned to review "${sop.title}".`,
            linkUrl: `/app/sops/${sop.id}`,
          },
        });
        emitToUser(tm.userId, 'notification', {
          title: 'Team SOP Assigned',
          message: `Your team was assigned to review "${sop.title}".`,
        });
      }
    }

    return assignment;
  }

  async acknowledgeSOP(
    orgId: string,
    sopId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const sop = await prisma.sOP.findFirst({
      where: { id: sopId, organizationId: orgId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!sop || sop.versions.length === 0) {
      throw new NotFoundError('SOP or current version not found');
    }

    const currentVersion = sop.versions[0];

    const acknowledgement = await prisma.sOPAcknowledgement.upsert({
      where: {
        sopId_userId_sopVersionId: {
          sopId: sop.id,
          userId,
          sopVersionId: currentVersion.id,
        },
      },
      update: {
        acknowledgedAt: new Date(),
        ipAddress,
        userAgent,
      },
      create: {
        sopId: sop.id,
        sopVersionId: currentVersion.id,
        organizationId: orgId,
        userId,
        ipAddress,
        userAgent,
      },
    });

    return acknowledgement;
  }

  async addComment(
    orgId: string,
    sopId: string,
    userId: string,
    content: string,
    parentId?: string
  ) {
    const sop = await prisma.sOP.findFirst({
      where: { id: sopId, organizationId: orgId },
    });

    if (!sop) {
      throw new NotFoundError('SOP not found');
    }

    return await prisma.sOPComment.create({
      data: {
        sopId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async deleteSOP(orgId: string, sopId: string) {
    const sop = await prisma.sOP.findFirst({
      where: { id: sopId, organizationId: orgId },
    });

    if (!sop) {
      throw new NotFoundError('SOP not found');
    }

    return await prisma.sOP.delete({
      where: { id: sopId },
    });
  }
}

export const sopService = new SOPService();
