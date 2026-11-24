import { z } from 'zod';
import { TrainingCategory, TrainingStatus, LessonType } from '@prisma/client';

export const createTrainingProgramSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.nativeEnum(TrainingCategory).default(TrainingCategory.REMOTE_FUNDAMENTALS),
  thumbnail: z.string().url().optional(),
  estimatedHours: z.number().default(1),
  passingScore: z.number().min(50).max(100).default(80),
  status: z.nativeEnum(TrainingStatus).default(TrainingStatus.PUBLISHED),
});

export const createModuleSchema = z.object({
  title: z.string().min(2, 'Module title is required'),
  description: z.string().optional(),
  order: z.number().default(0),
});

export const createLessonSchema = z.object({
  title: z.string().min(2, 'Lesson title is required'),
  content: z.string().min(10, 'Lesson content is required'),
  contentType: z.nativeEnum(LessonType).default(LessonType.ARTICLE),
  resourceUrl: z.string().url().optional(),
  durationMinutes: z.number().default(10),
  order: z.number().default(0),
});

export const createQuizSchema = z.object({
  title: z.string().min(2, 'Quiz title is required'),
  description: z.string().optional(),
  timeLimitMinutes: z.number().default(15),
  passingScore: z.number().min(50).max(100).default(80),
  maxAttempts: z.number().default(3),
  questions: z.array(
    z.object({
      questionText: z.string().min(3),
      explanation: z.string().optional(),
      points: z.number().default(1),
      order: z.number().default(0),
      options: z.array(
        z.object({
          optionText: z.string().min(1),
          isCorrect: z.boolean(),
          order: z.number().default(0),
        })
      ).min(2, 'At least 2 options required'),
    })
  ).min(1, 'At least 1 question required'),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedOptionId: z.string().uuid(),
    })
  ),
});
