import { Router } from 'express';
import { workflowController } from './workflows.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { Role } from '@prisma/client';
import {
  createWorkflowSchema,
  createTaskSchema,
  updateTaskStageSchema,
  taskApprovalSchema,
  addWorkflowCommentSchema,
} from './workflows.validators.js';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/', workflowController.list);
router.get('/:id', workflowController.getBoard);

router.post(
  '/',
  requireRole(Role.TEAM_MANAGER),
  validate({ body: createWorkflowSchema }),
  workflowController.create
);

router.post(
  '/:id/tasks',
  validate({ body: createTaskSchema }),
  workflowController.createTask
);

router.patch(
  '/tasks/:taskId/stage',
  validate({ body: updateTaskStageSchema }),
  workflowController.updateTaskStage
);

router.post(
  '/approvals/:approvalId',
  validate({ body: taskApprovalSchema }),
  workflowController.reviewApproval
);

router.post(
  '/:id/comments',
  validate({ body: addWorkflowCommentSchema }),
  workflowController.addComment
);

export default router;
