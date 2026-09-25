import { loadDotEnv } from './env';
import { loadConfig } from './config';
import { createDb } from './db/client';
import { buildApp } from './app';

async function main() {
  loadDotEnv();
  const config = loadConfig();
  const { pool, ping } = createDb(config.DATABASE_URL);
  const app = await buildApp({ config, pingDb: ping });
  app.addHook('onClose', async () => {
    await pool.end();
  });

  if (!config.ANTHROPIC_API_KEY) app.log.warn('ANTHROPIC_API_KEY is not set; the narrator will not work');

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, async () => {
      app.log.info({ signal }, 'Shutting down');
      await app.close();
      process.exit(0);
    });
  }

  await app.listen({ port: config.PORT, host: config.HOST });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
