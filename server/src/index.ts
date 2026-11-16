import { loadDotEnv } from './env';
import { loadConfig } from './config';
import { createDb } from './db/client';
import { buildApp } from './app';

async function main() {
  loadDotEnv();
  const config = loadConfig();
  const { db, pool, ping } = createDb(config.DATABASE_URL);
  const app = await buildApp({ config, db, pingDb: ping });
  app.addHook('onClose', async () => {
    await pool.end();
  });

  if (config.LLM_BASE_URL) {
    app.log.info({ narrator: config.NARRATOR_MODEL, utility: config.UTILITY_MODEL, thinkingTokens: config.LLM_THINKING_TOKENS }, config.LLM_PROXY_URL ? 'Using the self-hosted model server at LLM_BASE_URL, through LLM_PROXY_URL' : 'Using the self-hosted model server at LLM_BASE_URL');
  } else if (!config.ANTHROPIC_API_KEY) {
    app.log.warn('Neither LLM_BASE_URL nor ANTHROPIC_API_KEY is set; the narrator will not work');
  }

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
