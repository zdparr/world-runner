import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The same code runs from src/ (tsx) and dist/ (bundled), at different depths,
// so locate the repo root by walking up to the Render blueprint.
function findRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(join(dir, 'render.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error('Could not locate repo root (render.yaml not found)');
    dir = parent;
  }
}

export const repoRoot = findRepoRoot();
export const webDistDir = resolve(repoRoot, 'web/dist');
export const migrationsDir = resolve(repoRoot, 'drizzle');
