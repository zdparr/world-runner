import { z } from 'zod';

/** A "true"/"false" environment flag (z.coerce.boolean would read "false" as true). */
const flag = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => (v === undefined ? fallback : v === 'true' || v === '1'));

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().min(1),
  APP_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(32, 'must be at least 32 characters'),
  // Optional so the app still boots (and can be configured) without it; turns return 503 until it is set.
  ANTHROPIC_API_KEY: z.string().optional(),
  NARRATOR_MODEL: z.string().min(1).default('claude-sonnet-5'),
  /** Background jobs: story extraction, summaries, note condensing. */
  UTILITY_MODEL: z.string().min(1).default('claude-haiku-5-5'),
  /** Thinking depth for the narrator. Medium keeps turns responsive; high trades latency for care. */
  NARRATOR_EFFORT: z.enum(['low', 'medium', 'high']).default('medium'),
  /** After each turn, record what the narration established (people, events, threads, scene). */
  EXTRACTION_ENABLED: flag(true),
  /** How long a turn waits for the previous turn's extraction before going ahead without it. */
  EXTRACTION_WAIT_MS: z.coerce.number().int().min(0).max(60_000).default(10_000),
  /** Store each turn's fully assembled prompt in turn_debug (for diagnosing drift; large). */
  DEBUG_PROMPTS: flag(false),
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
