import crypto from 'crypto';
import { prisma } from '../../services/prisma.js';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../utils/errors.js';
import { sendEmail } from '../../services/email.js';
import { Role } from '@prisma/client';

export class OrganizationService {
  async createOrganization(userId: string, data: { name: string; domain?: string; logoUrl?: string }) {
    const slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    return await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          domain: data.domain,
          logoUrl: data.logoUrl,
          createdById: userId,
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId,
          role: Role.ORG_ADMIN,
        },
      });

      return { organization: org, member };
    });
  }

  async getOrganization(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        departments: {
          include: {
            teams: true,
          },
        },
        teams: true,
        _count: {
          select: {
            members: true,
            sops: true,
            workflows: true,
            trainingPrograms: true,
            workshops: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return org;
  }

  async updateOrganization(orgId: string, data: { name?: string; domain?: string; logoUrl?: string }) {
    return await prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  async listMembers(orgId: string, query?: { search?: string; role?: Role; departmentId?: string; teamId?: string }) {
    const where: any = { organizationId: orgId };

    if (query?.role) {
      where.role = query.role;
    }
    if (query?.departmentId) {
      where.departmentId = query.departmentId;
    }
    if (query?.teamId) {
      where.teamId = query.teamId;
    }
    if (query?.search) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    return await prisma.organizationMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            jobTitle: true,
            timezone: true,
            lastLoginAt: true,
          },
        },
        department: true,
        team: true,
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async inviteMember(
    orgId: string,
    invitedById: string,
    data: { email: string; role: Role; departmentId?: string; teamId?: string }
  ) {
    const targetEmail = data.email.toLowerCase();

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        user: { email: targetEmail },
      },
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this organization');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: orgId,
        email: targetEmail,
        role: data.role,
        departmentId: data.departmentId,
        teamId: data.teamId,
        token,
        expiresAt,
        invitedById,
      },
      include: {
        organization: true,
      },
    });

    await sendEmail({
      to: targetEmail,
      subject: `Invitation to join ${invitation.organization.name} on AsyncFlow`,
      html: `
        <h2>You have been invited!</h2>
        <p>You have been invited to join <strong>${invitation.organization.name}</strong> as a ${data.role} on AsyncFlow.</p>
        <p>Click below to accept your invitation:</p>
        <p><a href="http://localhost:5173/accept-invite?token=${token}">Accept Invitation</a></p>
        <p>Token: <code>${token}</code></p>
      `,
      text: `Join ${invitation.organization.name} on AsyncFlow. Token: ${token}`,
    });

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation || invitation.status !== 'PENDING' || new Date() > invitation.expiresAt) {
      throw new BadRequestError('Invalid or expired invitation token');
    }

    const member = await prisma.$transaction(async (tx) => {
      const newMember = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: invitation.role,
          departmentId: invitation.departmentId,
          teamId: invitation.teamId,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return newMember;
    });

    return { member, organization: invitation.organization };
  }

  async updateMemberRole(
    orgId: string,
    memberId: string,
    data: { role: Role; departmentId?: string | null; teamId?: string | null }
  ) {
    return await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        role: data.role,
        departmentId: data.departmentId,
        teamId: data.teamId,
      },
      include: {
        user: true,
        department: true,
        team: true,
      },
    });
  }

  async removeMember(orgId: string, memberId: string) {
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new NotFoundError('Member not found');
    }

    return await prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }

  // Departments
  async listDepartments(orgId: string) {
    return await prisma.department.findMany({
      where: { organizationId: orgId },
      include: {
        teams: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(orgId: string, data: { name: string; description?: string }) {
    return await prisma.department.create({
      data: {
        organizationId: orgId,
        name: data.name,
        description: data.description,
      },
    });
  }

  // Teams
  async listTeams(orgId: string) {
    return await prisma.team.findMany({
      where: { organizationId: orgId },
      include: {
        department: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTeam(
    orgId: string,
    data: { name: string; departmentId?: string; description?: string; leadId?: string }
  ) {
    return await prisma.team.create({
      data: {
        organizationId: orgId,
        name: data.name,
        departmentId: data.departmentId,
        description: data.description,
        leadId: data.leadId,
      },
    });
  }
}

export const organizationService = new OrganizationService();
