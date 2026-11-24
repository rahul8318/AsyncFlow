import { Router } from 'express';
import { trainingController } from './training.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { Role } from '@prisma/client';
import {
  createTrainingProgramSchema,
  createModuleSchema,
  createLessonSchema,
  createQuizSchema,
  submitQuizSchema,
} from './training.validators.js';

const router = Router();

router.use(authenticate, requireTenant);

// Student endpoints
router.get('/', trainingController.listPrograms);
router.get('/my-learning', trainingController.getMyLearning);
router.get('/:id', trainingController.getProgramDetails);
router.post('/:id/enroll', trainingController.enroll);
router.post('/:id/lessons/:lessonId/complete', trainingController.completeLesson);
router.get('/quizzes/:quizId', trainingController.getQuiz);
router.post(
  '/quizzes/:quizId/submit',
  validate({ body: submitQuizSchema }),
  trainingController.submitQuiz
);

// Admin / Author endpoints
router.post(
  '/',
  requireRole(Role.ORG_ADMIN),
  validate({ body: createTrainingProgramSchema }),
  trainingController.createProgram
);

router.post(
  '/:id/modules',
  requireRole(Role.ORG_ADMIN),
  validate({ body: createModuleSchema }),
  trainingController.addModule
);

router.post(
  '/modules/:moduleId/lessons',
  requireRole(Role.ORG_ADMIN),
  validate({ body: createLessonSchema }),
  trainingController.addLesson
);

router.post(
  '/:id/quiz',
  requireRole(Role.ORG_ADMIN),
  validate({ body: createQuizSchema }),
  trainingController.createQuiz
);

export default router;
