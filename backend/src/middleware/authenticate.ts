import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { prisma } from '../services/prisma.js';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        timezone: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    req.user = user;

    // Check for organization context via header, query, or token
    const orgId =
      (req.headers['x-organization-id'] as string) ||
      (req.query.organizationId as string) ||
      decoded.organizationId;

    if (orgId) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: user.id,
          },
        },
      });

      if (member && member.status === 'ACTIVE') {
        req.member = member;
        req.organizationId = orgId;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
