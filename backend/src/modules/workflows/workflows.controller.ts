import { Request, Response, NextFunction } from 'express';
import { workflowService } from './workflows.service.js';
import { sendSuccess } from '../../utils/response.js';
import { logActivity } from '../../utils/auditLogger.js';

export class WorkflowController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.listWorkflows(
        req.organizationId!,
        req.query as any
      );
      return sendSuccess(res, result, 'Workflows fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workflowService.getWorkflowBoard(req.organizationId!, id);
      return sendSuccess(res, result, 'Workflow board fetched');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.createWorkflow(
        req.organizationId!,
        req.user!.id,
        req.body
      );
      await logActivity(req, 'WORKFLOW_CREATED', 'WORKFLOW', result.id, { title: result.title });
      return sendSuccess(res, result, 'Workflow created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workflowService.createTask(
        req.organizationId!,
        id,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, result, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const result = await workflowService.updateTaskStage(
        req.organizationId!,
        taskId,
        req.body
      );
      return sendSuccess(res, result, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async reviewApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const { approvalId } = req.params;
      const result = await workflowService.reviewApproval(
        req.organizationId!,
        approvalId,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, result, 'Approval updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await workflowService.addWorkflowComment(
        req.organizationId!,
        id,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, result, 'Comment added', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const workflowController = new WorkflowController();
