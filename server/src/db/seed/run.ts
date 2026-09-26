import pino from 'pino';
import { loadDotEnv } from '../../env';
import { createDb } from '../client';
import { TEMPLATES, findTemplate, seedDemoCampaign } from './templates';

// `npm run seed` creates the default demo campaign (Varenhold).
//   --world <id>   seed a different world (varenhold, brinecross, harrowmere, five-banners, threshold)
//   --all          seed every world
//   --reset        delete and recreate the demo campaign(s); other campaigns are untouched
async function main() {
  loadDotEnv();
  const log = pino({ name: 'seed' });
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const args = process.argv.slice(2);
  const reset = args.includes('--reset');
  const worldArg = args[args.indexOf('--world') + 1];
  const worlds = args.includes('--all')
    ? TEMPLATES
    : [args.includes('--world') && worldArg ? findTemplate(worldArg) : TEMPLATES[0]];
  if (worlds.some((w) => !w)) {
    throw new Error(`Unknown world "${worldArg}". Available: ${TEMPLATES.map((t) => t.id).join(', ')}`);
  }

  const { db, pool } = createDb(url);
  try {
    for (const world of worlds) {
      const id = await seedDemoCampaign(db, { templateId: world!.id, reset });
      if (id) log.info({ campaignId: id }, `Seeded "${world!.demoCampaignName}"`);
      else log.info(`"${world!.demoCampaignName}" already exists; run with --reset to recreate it`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
