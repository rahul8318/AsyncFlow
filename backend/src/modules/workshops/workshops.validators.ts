import { z } from 'zod';
import { WorkshopStatus } from '@prisma/client';

export const createWorkshopSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  instructorName: z.string().min(2, 'Instructor name is required'),
  instructorId: z.string().uuid().optional(),
  coverImage: z.string().url().optional(),
  scheduledAt: z.string().datetime('Valid scheduled date and time required'),
  durationMinutes: z.number().min(15).max(480).default(60),
  timezone: z.string().default('UTC'),
  meetingUrl: z.string().url().optional(),
  maxAttendees: z.number().min(1).default(50),
  materialsUrl: z.string().url().optional(),
});

export const updateWorkshopSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  instructorName: z.string().min(2).optional(),
  coverImage: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().min(15).max(480).optional(),
  timezone: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  maxAttendees: z.number().min(1).optional(),
  status: z.nativeEnum(WorkshopStatus).optional(),
  materialsUrl: z.string().url().optional(),
});

export const submitFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});
