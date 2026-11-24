import { Request, Response, NextFunction } from 'express';
import { trainingService } from './training.service.js';
import { sendSuccess } from '../../utils/response.js';
import { logActivity } from '../../utils/auditLogger.js';

export class TrainingController {
  async listPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.listPrograms(
        req.organizationId!,
        req.user!.id,
        req.query as any
      );
      return sendSuccess(res, result, 'Training programs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getProgramDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await trainingService.getProgramDetails(
        req.organizationId!,
        id,
        req.user!.id
      );
      return sendSuccess(res, result, 'Program details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await trainingService.enroll(
        req.organizationId!,
        id,
        req.user!.id
      );
      return sendSuccess(res, result, 'Enrolled successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async completeLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, lessonId } = req.params;
      const result = await trainingService.completeLesson(
        req.organizationId!,
        id,
        lessonId,
        req.user!.id
      );
      return sendSuccess(res, result, 'Lesson marked complete');
    } catch (error) {
      next(error);
    }
  }

  async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizId } = req.params;
      const result = await trainingService.getQuizForStudent(quizId);
      return sendSuccess(res, result, 'Quiz loaded');
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizId } = req.params;
      const result = await trainingService.submitQuiz(
        req.organizationId!,
        quizId,
        req.user!.id,
        req.body.answers
      );
      await logActivity(req, 'QUIZ_SUBMITTED', 'QUIZ', quizId, {
        score: result.scorePercent,
        passed: result.isPassed,
      });
      return sendSuccess(res, result, 'Quiz graded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyLearning(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.getMyLearning(
        req.organizationId!,
        req.user!.id
      );
      return sendSuccess(res, result, 'My learning records retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.createProgram(
        req.organizationId!,
        req.user!.id,
        req.body
      );
      await logActivity(req, 'TRAINING_CREATED', 'TRAINING', result.id, { title: result.title });
      return sendSuccess(res, result, 'Program created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async addModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await trainingService.addModule(id, req.body);
      return sendSuccess(res, result, 'Module added', 201);
    } catch (error) {
      next(error);
    }
  }

  async addLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId } = req.params;
      const result = await trainingService.addLesson(moduleId, req.body);
      return sendSuccess(res, result, 'Lesson added', 201);
    } catch (error) {
      next(error);
    }
  }

  async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await trainingService.createQuiz(id, req.body);
      return sendSuccess(res, result, 'Quiz created', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const trainingController = new TrainingController();
