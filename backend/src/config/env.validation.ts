import * as Joi from 'joi';

function validateCorsOrigins(value: string, helpers: Joi.CustomHelpers): string | Joi.ErrorReport {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return helpers.error('any.invalid');
  }

  const isInvalid = origins.some((origin) => {
    try {
      const url = new URL(origin);
      return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin;
    } catch {
      return true;
    }
  });

  return isInvalid ? helpers.error('any.invalid') : value;
}

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+(?:ms|s|m|h|d|w|y)$/)
    .default('7d'),
  CORS_ORIGIN: Joi.string()
    .custom(validateCorsOrigins, 'CORS origin validation')
    .default('http://localhost:5173'),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),
  AI_PROVIDER: Joi.string().uppercase().valid('DOUBAO', 'QIANWEN').default('DOUBAO'),
  AI_TIMEOUT_MS: Joi.number().integer().min(1000).max(120000).default(30000),
  AI_RATE_LIMIT_MAX: Joi.number().integer().min(1).max(1000).default(20),
  AI_RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).max(3600000).default(60000),
  DOUBAO_API_KEY: Joi.string().allow('').default(''),
  DOUBAO_API_ENDPOINT: Joi.string()
    .uri({ scheme: ['https'] })
    .optional(),
  DOUBAO_MODEL: Joi.string().max(100).optional(),
  QIANWEN_API_KEY: Joi.string().allow('').default(''),
  QIANWEN_API_ENDPOINT: Joi.string()
    .uri({ scheme: ['https'] })
    .optional(),
  QIANWEN_MODEL: Joi.string().max(100).optional(),
}).unknown(true);

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const { error, value } = environmentSchema.validate(config, {
    abortEarly: false,
  });

  if (error) {
    throw new Error(`环境变量校验失败: ${error.message}`);
  }

  return value as Record<string, unknown>;
}
