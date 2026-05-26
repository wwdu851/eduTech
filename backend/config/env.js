const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  NEO4J_URI: z.string().url(),
  NEO4J_USER: z.string(),
  NEO4J_PASSWORD: z.string().min(8),
  JWT_SECRET: z.string().min(8).refine(value => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    return nodeEnv !== 'production' || value.length >= 32;
  }, {
    message: 'JWT_SECRET must be at least 32 characters in production'
  }),
  GEMINI_API_KEY: z.string(),
  FRONTEND_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

module.exports = parsed.data;
