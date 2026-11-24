import { Router } from 'express';
import { sopController } from './sops.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { Role } from '@prisma/client';
import {
  createSOPSchema,
  updateSOPSchema,
  assignSOPSchema,
  addCommentSchema,
} from './sops.validators.js';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/', sopController.list);
router.get('/:id', sopController.getById);

router.post(
  '/',
  requireRole(Role.TEAM_MANAGER),
  validate({ body: createSOPSchema }),
  sopController.create
);

router.patch(
  '/:id',
  requireRole(Role.TEAM_MANAGER),
  validate({ body: updateSOPSchema }),
  sopController.update
);

router.post(
  '/:id/assign',
  requireRole(Role.TEAM_MANAGER),
  validate({ body: assignSOPSchema }),
  sopController.assign
);

router.post('/:id/acknowledge', sopController.acknowledge);

router.post(
  '/:id/comments',
  validate({ body: addCommentSchema }),
  sopController.addComment
);

router.delete('/:id', requireRole(Role.ORG_ADMIN), sopController.delete);

export default router;
