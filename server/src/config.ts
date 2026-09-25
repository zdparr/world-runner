import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().min(1),
  APP_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(32, 'must be at least 32 characters'),
  // Not used until the turn engine (phase 3), so the skeleton can deploy without it.
  ANTHROPIC_API_KEY: z.string().optional(),
  NARRATOR_MODEL: z.string().min(1).default('claude-sonnet-5'),
  UTILITY_MODEL: z.string().min(1).default('claude-haiku-4-5-20251001'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    // Report which variables are wrong, never their values.
    const problems = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return parsed.data;
}
