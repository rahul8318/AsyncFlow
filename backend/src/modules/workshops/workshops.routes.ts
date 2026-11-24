import { Router } from 'express';
import { workshopController } from './workshops.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { Role } from '@prisma/client';
import {
  createWorkshopSchema,
  submitFeedbackSchema,
} from './workshops.validators.js';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/', workshopController.list);
router.get('/:id', workshopController.getDetails);
router.post('/:id/register', workshopController.register);
router.post('/:id/cancel', workshopController.cancelRegistration);
router.post(
  '/:id/feedback',
  validate({ body: submitFeedbackSchema }),
  workshopController.submitFeedback
);

router.post(
  '/',
  requireRole(Role.TEAM_MANAGER),
  validate({ body: createWorkshopSchema }),
  workshopController.create
);

export default router;
