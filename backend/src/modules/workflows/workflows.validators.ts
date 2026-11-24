import { z } from 'zod';
import { WorkflowCategory, Priority, WorkflowStatus, ApprovalStatus } from '@prisma/client';

export const createWorkflowSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(WorkflowCategory).default(WorkflowCategory.CUSTOM),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().datetime().optional(),
  stages: z
    .array(
      z.object({
        name: z.string(),
        order: z.number(),
        color: z.string().default('#64748b'),
        isCompletedStage: z.boolean().default(false),
      })
    )
    .optional(),
});

export const createTaskSchema = z.object({
  stageId: z.string().uuid(),
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  order: z.number().default(0),
  requiresApproval: z.boolean().default(false),
  approverId: z.string().uuid().optional(),
});

export const updateTaskStageSchema = z.object({
  stageId: z.string().uuid(),
  order: z.number().optional(),
  isCompleted: z.boolean().optional(),
});

export const taskApprovalSchema = z.object({
  status: z.nativeEnum(ApprovalStatus),
  comments: z.string().optional(),
});

export const addWorkflowCommentSchema = z.object({
  taskId: z.string().uuid().optional(),
  content: z.string().min(1, 'Comment text is required'),
});
