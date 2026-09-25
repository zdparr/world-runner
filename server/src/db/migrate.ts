import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import pino from 'pino';
import { loadDotEnv } from '../env';
import { migrationsDir } from '../paths';

// Runs as Render's preDeployCommand (`npm run db:migrate`) and locally via `npm run db:migrate:dev`.
async function main() {
  loadDotEnv();
  const log = pino({ name: 'migrate' });
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const pool = new pg.Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000 });
  try {
    await pool.query('select 1');
    if (!existsSync(join(migrationsDir, 'meta', '_journal.json'))) {
      log.info({ migrationsDir }, 'No migrations generated yet; database is reachable, nothing to apply');
      return;
    }
    log.info({ migrationsDir }, 'Applying migrations');
    await migrate(drizzle(pool), { migrationsFolder: migrationsDir });
    log.info('Migrations complete');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
