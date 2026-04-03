require('dotenv').config();

const { createApp } = require('./src/app');
const { initializePool, closePool } = require('./src/config/database');
const { loadEnvironment } = require('./src/config/environment');
const logger = require('./src/utils/logger');

async function startServer() {
  const env = loadEnvironment();
  const app = createApp();

  try {
    await initializePool();
    logger.info('Database pool initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize database pool. Server will start but DB-dependent routes will fail.', err.message);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await closePool();
        logger.info('Server shut down complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

startServer();
