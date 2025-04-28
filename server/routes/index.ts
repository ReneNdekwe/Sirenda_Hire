import { Express } from 'express';
import subscriptionRouter from './subscription';

export async function registerRoutes(app: Express) {
  // API routes
  app.use('/api/subscription', subscriptionRouter);

  return app;
} 