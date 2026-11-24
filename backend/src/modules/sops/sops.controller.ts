import { Request, Response, NextFunction } from 'express';
import { sopService } from './sops.service.js';
import { sendSuccess } from '../../utils/response.js';
import { logActivity } from '../../utils/auditLogger.js';

export class SOPController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sopService.listSOPs(
        req.organizationId!,
        req.user!.id,
        req.query as any
      );
      return sendSuccess(res, result, 'SOPs fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await sopService.getSOPById(
        req.organizationId!,
        id,
        req.user!.id
      );
      return sendSuccess(res, result, 'SOP details fetched');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sopService.createSOP(
        req.organizationId!,
        req.user!.id,
        req.body
      );
      await logActivity(req, 'SOP_CREATED', 'SOP', result.id, { title: result.title });
      return sendSuccess(res, result, 'SOP created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await sopService.updateSOP(
        req.organizationId!,
        id,
        req.user!.id,
        req.body
      );
      await logActivity(req, 'SOP_UPDATED', 'SOP', id, { version: result.currentVersionNumber });
      return sendSuccess(res, result, 'SOP updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await sopService.assignSOP(
        req.organizationId!,
        id,
        req.user!.id,
        req.body
      );
      await logActivity(req, 'SOP_ASSIGNED', 'SOP', id, req.body);
      return sendSuccess(res, result, 'SOP assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async acknowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await sopService.acknowledgeSOP(
        req.organizationId!,
        id,
        req.user!.id,
        ipAddress,
        userAgent
      );
      await logActivity(req, 'SOP_ACKNOWLEDGED', 'SOP', id);
      return sendSuccess(res, result, 'SOP acknowledged successfully');
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      const result = await sopService.addComment(
        req.organizationId!,
        id,
        req.user!.id,
        content,
        parentId
      );
      return sendSuccess(res, result, 'Comment added', 201);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await sopService.deleteSOP(req.organizationId!, id);
      await logActivity(req, 'SOP_DELETED', 'SOP', id);
      return sendSuccess(res, null, 'SOP deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const sopController = new SOPController();
