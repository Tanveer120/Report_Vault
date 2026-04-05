const oracledb = require('oracledb');
const { loadEnvironment } = require('./environment');
const logger = require('../utils/logger');

// Ensure CLOBs are parsed back as Strings to avoid circular references (Lob objects)
oracledb.fetchAsString = [oracledb.CLOB];

let pool = null;

async function initializePool() {
  if (pool) {
    return pool;
  }

  const env = loadEnvironment();

  try {
    pool = await oracledb.createPool({
      user: env.ORACLE_USER,
      password: env.ORACLE_PASSWORD,
      connectString: env.ORACLE_CONNECT_STRING,

      poolMin: env.ORACLE_POOL_MIN,
      poolMax: env.ORACLE_POOL_MAX,
      poolIncrement: env.ORACLE_POOL_INCREMENT,
      poolTimeout: env.ORACLE_POOL_TIMEOUT,
      queueTimeout: env.ORACLE_QUEUE_TIMEOUT,

      stmtCacheSize: env.ORACLE_STMT_CACHE_SIZE,
      prefetchRows: env.ORACLE_PREFETCH_ROWS,
    });

    pool.execute = async function(sql, binds = [], options = {}) {
      const connection = await this.getConnection();
      try {
        return await connection.execute(sql, binds, options);
      } finally {
        try {
          await connection.close();
        } catch (err) {
          logger.error('Error closing connection:', err);
        }
      }
    };

    logger.info(`Oracle connection pool created (min: ${env.ORACLE_POOL_MIN}, max: ${env.ORACLE_POOL_MAX})`);
    return pool;
  } catch (err) {
    logger.error('Failed to create Oracle connection pool:', err);
    throw err;
  }
}

async function closePool() {
  if (pool) {
    try {
      await pool.close(10);
      logger.info('Oracle connection pool closed');
      pool = null;
    } catch (err) {
      logger.error('Error closing Oracle connection pool:', err);
      throw err;
    }
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Connection pool not initialized. Call initializePool() first.');
  }
  return pool;
}

async function getPoolStats() {
  if (!pool) return null;

  return {
    connectionsInUse: pool.connectionsInUse,
    connectionsOpen: pool.connectionsOpen,
    queueLength: pool.queueLength,
  };
}

module.exports = {
  initializePool,
  closePool,
  getPool,
  getPoolStats,
};
