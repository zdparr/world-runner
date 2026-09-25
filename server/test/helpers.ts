import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { FastifyInstance, InjectOptions } from 'fastify';
import { buildApp } from '../src/app';
import { DB_CASING, type Db } from '../src/db/client';
import type { StreamFn } from '../src/engine/narrator';
import * as schema from '../src/db/schema';
import { loadConfig } from '../src/config';
import { migrationsDir } from '../src/paths';

export const TEST_PASSWORD = 'correct horse battery staple';

export const testConfig = loadConfig({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgres://unused',
  APP_PASSWORD: TEST_PASSWORD,
  SESSION_SECRET: 'x'.repeat(32),
});

/** In-process Postgres (PGlite) with the real committed migrations applied. */
export async function createTestDb(): Promise<{ db: Db; close: () => Promise<void> }> {
  const client = new PGlite();
  const pgliteDb = drizzle(client, { schema, casing: DB_CASING });
  await migrate(pgliteDb, { migrationsFolder: migrationsDir });
  return { db: pgliteDb as unknown as Db, close: () => client.close() };
}

/**
 * An app backed by a fresh PGlite database, plus an `api` helper that sends an authenticated request.
 * The narrator's model is whatever was last passed to `setModel` (a scripted fake).
 */
export async function createTestApp() {
  const { db, close } = await createTestDb();
  let model: StreamFn | null = null;
  const stream: StreamFn = (params) => {
    if (!model) throw new Error('No model scripted: call setModel() first');
    return model(params);
  };
  const app: FastifyInstance = await buildApp({ config: testConfig, db, pingDb: async () => {}, stream, serveWeb: false });
  const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { password: TEST_PASSWORD } });
  const cookie = login.cookies[0]!;
  const cookies = { [cookie.name]: cookie.value };

  const api = (method: InjectOptions['method'], url: string, payload?: unknown) =>
    app.inject({ method, url, cookies, ...(payload === undefined ? {} : { payload: payload as object }) });

  return {
    app,
    db,
    api,
    setModel: (fake: StreamFn) => {
      model = fake;
    },
    close: async () => {
      await app.close();
      await close();
    },
  };
}
