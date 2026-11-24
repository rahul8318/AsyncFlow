import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, BadRequestError } from '../utils/errors.js';
import { prisma } from '../services/prisma.js';

export const requireTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Try finding the org from header, route params, query, or req.organizationId
    let orgId =
      req.organizationId ||
      (req.headers['x-organization-id'] as string) ||
      (req.params.organizationId as string) ||
      (req.query.organizationId as string);

    if (!orgId) {
      // If user has memberships, fall back to first active membership
      const firstMembership = await prisma.organizationMember.findFirst({
        where: { userId: req.user.id, status: 'ACTIVE' },
        include: { organization: true },
      });

      if (!firstMembership) {
        throw new ForbiddenError('No active organization membership found. Please create or join an organization.');
      }

      orgId = firstMembership.organizationId;
      req.member = firstMembership;
      req.organizationId = orgId;
      return next();
    }

    if (!req.member || req.member.organizationId !== orgId) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: req.user.id,
          },
        },
      });

      if (!member || member.status !== 'ACTIVE') {
        throw new ForbiddenError('You do not belong to this organization or your membership is inactive');
      }

      req.member = member;
      req.organizationId = orgId;
    }

    next();
  } catch (error) {
    next(error);
  }
};
