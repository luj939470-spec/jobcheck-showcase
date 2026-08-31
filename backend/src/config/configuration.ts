export default () => ({
  app: {
    environment: process.env.NODE_ENV ?? 'development',
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
  },
  cors: {
    origins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  ai: {
    provider: (process.env.AI_PROVIDER ?? 'DOUBAO').toLowerCase(),
    timeoutMs: Number.parseInt(process.env.AI_TIMEOUT_MS ?? '30000', 10),
    rateLimit: {
      max: Number.parseInt(process.env.AI_RATE_LIMIT_MAX ?? '20', 10),
      windowMs: Number.parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    },
    doubao: {
      apiKey: process.env.DOUBAO_API_KEY ?? '',
      endpoint:
        process.env.DOUBAO_API_ENDPOINT ??
        'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      model: process.env.DOUBAO_MODEL ?? 'doubao-seed-1-6-250615',
    },
    qianwen: {
      apiKey: process.env.QIANWEN_API_KEY ?? '',
      endpoint:
        process.env.QIANWEN_API_ENDPOINT ??
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      model: process.env.QIANWEN_MODEL ?? 'qwen-plus',
    },
  },
});
