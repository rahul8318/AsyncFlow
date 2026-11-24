import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation error', 422, formattedErrors);
  }

  // 2. Custom AppError instances
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(res, `A record with this ${target} already exists.`, 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found.', 404);
    }
    if (err.code === 'P2003') {
      return sendError(res, 'Foreign key constraint violated.', 400);
    }
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired.', 401);
  }

  // 5. Unhandled Server Error
  console.error('Unhandled Server Error:', err);
  return sendError(res, 'Internal server error', 500);
};
