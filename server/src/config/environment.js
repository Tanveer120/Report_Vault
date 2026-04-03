const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  ORACLE_USER: Joi.string().required(),
  ORACLE_PASSWORD: Joi.string().required(),
  ORACLE_CONNECT_STRING: Joi.string().required(),
  ORACLE_POOL_MIN: Joi.number().default(4),
  ORACLE_POOL_MAX: Joi.number().default(20),
  ORACLE_POOL_INCREMENT: Joi.number().default(2),
  ORACLE_POOL_TIMEOUT: Joi.number().default(60),
  ORACLE_QUEUE_TIMEOUT: Joi.number().default(30000),
  ORACLE_STMT_CACHE_SIZE: Joi.number().default(30),
  ORACLE_PREFETCH_ROWS: Joi.number().default(1000),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  QUERY_TIMEOUT_MS: Joi.number().default(60000),
  MAX_MULTI_VALUES: Joi.number().default(50000),
  IN_CLAUSE_LIMIT: Joi.number().default(999),
}).unknown();

function loadEnvironment() {
  const { error, value: env } = envSchema.validate(process.env, { abortEarly: false });

  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }

  return env;
}

module.exports = { loadEnvironment };
