import { Role, MemberStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        timezone: string;
        isEmailVerified: boolean;
      };
      member?: {
        id: string;
        organizationId: string;
        userId: string;
        role: Role;
        status: MemberStatus;
        departmentId?: string | null;
        teamId?: string | null;
      };
      organizationId?: string;
    }
  }
}

export {};
