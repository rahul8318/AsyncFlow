import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AnalyticsController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = req.query.departmentId as string | undefined;
      const result = await analyticsService.getDashboardMetrics(
        req.organizationId!,
        departmentId
      );
      return sendSuccess(res, result, 'Dashboard metrics fetched');
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const timeframe = parseInt((req.query.timeframe as string) || '30', 10);
      const result = await analyticsService.getAnalyticsTrends(
        req.organizationId!,
        timeframe
      );
      return sendSuccess(res, result, 'Analytics trends fetched');
    } catch (error) {
      next(error);
    }
  }

  async downloadCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await analyticsService.generateCSVReport(req.organizationId!);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="asyncflow-report-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
