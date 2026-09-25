import pino from 'pino';
import { loadDotEnv } from '../../env';
import { createDb } from '../client';
import { DEMO_CAMPAIGN_NAME, seedDemoCampaign } from './demo';

// `npm run seed` creates the demo campaign. `npm run seed -- --reset` replaces it (other campaigns are untouched).
async function main() {
  loadDotEnv();
  const log = pino({ name: 'seed' });
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const reset = process.argv.includes('--reset');
  const { db, pool } = createDb(url);
  try {
    const id = await seedDemoCampaign(db, { reset });
    if (id) log.info({ campaignId: id }, `Seeded "${DEMO_CAMPAIGN_NAME}"`);
    else log.info(`"${DEMO_CAMPAIGN_NAME}" already exists; run with --reset to recreate it`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
