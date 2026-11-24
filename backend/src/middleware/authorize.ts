import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../utils/errors.js';

const roleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 40,
  [Role.ORG_ADMIN]: 30,
  [Role.TEAM_MANAGER]: 20,
  [Role.EMPLOYEE]: 10,
};

export const requireRole = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.member && !req.user) {
      return next(new ForbiddenError('Access denied: Authentication required'));
    }

    const currentRole = req.member?.role || Role.EMPLOYEE;
    const currentLevel = roleHierarchy[currentRole] ?? 0;
    const requiredLevel = roleHierarchy[minimumRole] ?? 0;

    if (currentLevel < requiredLevel) {
      return next(
        new ForbiddenError(
          `Insufficient permissions. Requires at least ${minimumRole} privileges.`
        )
      );
    }

    next();
  };
};

export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.member?.role !== Role.SUPER_ADMIN) {
    return next(new ForbiddenError('Super Admin access required'));
  }
  next();
};
