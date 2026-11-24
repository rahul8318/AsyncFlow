import { Request, Response, NextFunction } from 'express';
import { workshopService } from './workshops.service.js';
import { sendSuccess } from '../../utils/response.js';
import { logActivity } from '../../utils/auditLogger.js';

export class WorkshopController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workshopService.listWorkshops(
        req.organizationId!,
        req.user!.id,
        req.query as any
      );
      return sendSuccess(res, result, 'Workshops fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workshopService.getWorkshopDetails(
        req.organizationId!,
        id,
        req.user!.id
      );
      return sendSuccess(res, result, 'Workshop details fetched');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workshopService.createWorkshop(
        req.organizationId!,
        req.user!.id,
        req.body
      );
      await logActivity(req, 'WORKSHOP_CREATED', 'WORKSHOP', result.id, { title: result.title });
      return sendSuccess(res, result, 'Workshop created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workshopService.register(
        req.organizationId!,
        id,
        req.user!.id
      );
      await logActivity(req, 'WORKSHOP_REGISTERED', 'WORKSHOP', id);
      return sendSuccess(res, result, 'Registered for workshop', 201);
    } catch (error) {
      next(error);
    }
  }

  async cancelRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workshopService.cancelRegistration(
        req.organizationId!,
        id,
        req.user!.id
      );
      return sendSuccess(res, result, 'Registration cancelled');
    } catch (error) {
      next(error);
    }
  }

  async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workshopService.submitFeedback(
        req.organizationId!,
        id,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, result, 'Feedback submitted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const workshopController = new WorkshopController();
