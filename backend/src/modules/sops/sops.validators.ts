import { z } from 'zod';
import { SOPCategory, Priority, SOPStatus } from '@prisma/client';

export const createSOPSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  category: z.nativeEnum(SOPCategory).default(SOPCategory.GENERAL),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        required: z.boolean().default(true),
      })
    )
    .optional(),
  status: z.nativeEnum(SOPStatus).default(SOPStatus.PUBLISHED),
});

export const updateSOPSchema = z.object({
  title: z.string().min(3).optional(),
  summary: z.string().min(10).optional(),
  category: z.nativeEnum(SOPCategory).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(SOPStatus).optional(),
  content: z.string().min(20).optional(),
  changelog: z.string().optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        required: z.boolean().default(true),
      })
    )
    .optional(),
  createNewVersion: z.boolean().default(false),
});

export const assignSOPSchema = z.object({
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment text is required'),
  parentId: z.string().uuid().optional(),
});
