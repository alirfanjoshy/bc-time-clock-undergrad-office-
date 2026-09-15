import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { env } from './config/env.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { meRoutes } from './routes/me.routes.js';
import { reportsRoutes } from './routes/reports.routes.js';
import { timeRoutes } from './routes/time.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp(options: { webDistPath?: string } = {}) {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: { frameSrc: ["'self'", 'https://www.google.com'] },
    },
  }));
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/health', (_req, res) => {
    res.json({
      data: {
        status: 'ok',
        service: 'bc-recruitment-timeclock-backend',
      },
    });
  });

  app.get('/api', (_req, res) => {
    res.json({
      data: {
        status: 'ok',
        service: 'bc-recruitment-timeclock-api',
        message: 'Use the documented API endpoints for authentication, time tracking, and reports.',
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api/time', timeRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/reports', reportsRoutes);

  const webDistPath = options.webDistPath ?? env.WEB_DIST_PATH;
  if (webDistPath) {
    const directory = path.resolve(webDistPath);
    if (!existsSync(path.join(directory, 'index.html'))) {
      throw new Error('WEB_DIST_PATH must contain the built web app index.html');
    }
    // Unknown API requests must stay JSON errors, never the web app HTML.
    app.use('/api', notFoundHandler);
    app.use(express.static(directory, {
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html') || filePath.endsWith('.webmanifest')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
        if (filePath.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
      },
    }));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
