const express = require('express');
const helmet = require('helmet');
const { configureCors } = require('./config/cors');
const { loadEnvironment } = require('./config/environment');
const { getPoolStats } = require('./config/database');
const errorMiddleware = require('./middleware/error.middleware');
const { generalLimiter, authLimiter, exportLimiter, executionLimiter } = require('./middleware/rate-limiter');
const logger = require('./utils/logger');

function createApp() {
  const env = loadEnvironment();
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));
  configureCors(app, env.CORS_ORIGIN);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(generalLimiter);

  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/api/health', async (req, res) => {
    const poolStats = await getPoolStats();
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: poolStats ? {
        connectionsInUse: poolStats.connectionsInUse,
        connectionsOpen: poolStats.connectionsOpen,
        queueLength: poolStats.queueLength,
      } : 'not_connected',
    });
  });

  const authRoutes = require('./routes/auth.routes');
  app.use('/api/auth', authLimiter, authRoutes);

  const reportRoutes = require('./routes/report.routes');
  app.use('/api/reports', reportRoutes);

  const executeRoutes = require('./routes/execute.routes');
  app.use('/api/reports', executeRoutes);

  const exportRoutes = require('./routes/export.routes');
  app.use('/api/reports', exportRoutes);

  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
