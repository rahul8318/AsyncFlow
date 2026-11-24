import { z } from 'zod';
import { Role } from '@prisma/client';

export const createOrgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  domain: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role),
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
});

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  departmentId: z.string().uuid().optional(),
  description: z.string().optional(),
  leadId: z.string().uuid().optional(),
});
