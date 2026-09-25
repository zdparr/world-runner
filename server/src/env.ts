import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './paths';

// Local dev convenience: load the repo-root .env if present. Render injects real env vars.
export function loadDotEnv(): void {
  if (process.env.NODE_ENV === 'production') return;
  const file = join(repoRoot, '.env');
  if (existsSync(file)) process.loadEnvFile(file);
}
