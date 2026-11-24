import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './utils/errors.js';

// Import Route Handlers
import authRoutes from './modules/auth/auth.routes.js';
import orgRoutes from './modules/organizations/organizations.routes.js';
import sopRoutes from './modules/sops/sops.routes.js';
import workflowRoutes from './modules/workflows/workflows.routes.js';
import trainingRoutes from './modules/training/training.routes.js';
import workshopRoutes from './modules/workshops/workshops.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import uploadRoutes from './modules/uploads/uploads.routes.js';

export const createApp = () => {
  const app = express();

  // Security & Utility Middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
    })
  );

  app.use(cookieParser());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Static uploads directory
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'AsyncFlow API',
    });
  });

  // Interactive Swagger/OpenAPI Documentation
  try {
    const swaggerDocument = YAML.load(path.resolve(process.cwd(), 'src/docs/openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (err) {
    console.warn('Swagger doc load notice:', err);
  }

  // Apply general API rate limiting to v1 endpoints
  app.use('/api/v1', apiLimiter);

  // Mount API Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/organizations', orgRoutes);
  app.use('/api/v1/sops', sopRoutes);
  app.use('/api/v1/workflows', workflowRoutes);
  app.use('/api/v1/training', trainingRoutes);
  app.use('/api/v1/workshops', workshopRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/uploads', uploadRoutes);

  // Fallback 404 Handler for unmatched routes
  app.use('*', (req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp;
