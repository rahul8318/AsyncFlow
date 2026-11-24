import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireTenant } from '../../middleware/tenant.js';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/trends', analyticsController.getTrends);
router.get('/export-csv', analyticsController.downloadCSV);

export default router;
