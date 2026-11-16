// Gives existing campaigns their world's drawn map: sets campaigns.map_art and fills in the map
// positions of the world's own places (matched by name) that have none. New campaigns get both when
// they are created; this is for campaigns made before their world had a map.
//
//   DATABASE_URL=... npx tsx scripts/backfill-maps.ts            # dry run: prints what would change
//   DATABASE_URL=... npx tsx scripts/backfill-maps.ts --apply    # writes it
//
// A campaign's world is recognised by the first line of its world bible (its title). Positions are
// only filled in when they would agree with any the narrator already set: if a campaign has placed
// places, the world's starting place must be at (0, 0) in it, or the campaign is skipped.
import { and, eq, isNull } from 'drizzle-orm';
import { createDb } from '../server/src/db/client';
import { campaigns, locations } from '../server/src/db/schema';
import { TEMPLATES } from '../server/src/db/seed/templates';

const apply = process.argv.includes('--apply');
const { db, pool } = createDb(process.env.DATABASE_URL!);
const title = (bible: string) => bible.trim().split('\n')[0]!.trim();

for (const c of await db.select().from(campaigns)) {
  const world = TEMPLATES.find((t) => t.mapArt && title(t.worldBible) === title(c.worldBible));
  if (!world) continue;
  const rows = await db.select().from(locations).where(eq(locations.campaignId, c.id));
  const placed = rows.filter((r) => r.mapX !== null && r.mapY !== null);
  const origin = world.locations.find((l) => l.map && l.map.x === 0 && l.map.y === 0);
  const originRow = origin && rows.find((r) => r.name.toLowerCase() === origin.name.toLowerCase());
  if (placed.length > 0 && !(originRow && originRow.mapX === 0 && originRow.mapY === 0)) {
    console.log(`SKIP ${c.name}: it already has ${placed.length} placed places measured from somewhere other than ${origin?.name ?? 'the world origin'}`);
    continue;
  }
  const fills = rows.flatMap((r) => {
    if (r.mapX !== null && r.mapY !== null) return [];
    const l = world.locations.find((w) => w.map && w.name.toLowerCase() === r.name.toLowerCase());
    return l ? [{ id: r.id, name: r.name, x: l.map!.x, y: l.map!.y }] : [];
  });
  const setArt = c.mapArt !== world.mapArt;
  console.log(`${apply ? 'APPLY' : 'DRY'} ${c.name} (${world.id}): ${setArt ? `map_art -> ${world.mapArt}, ` : ''}${fills.length} positions: ${fills.map((f) => f.name).join(', ') || '-'}`);
  if (!apply) continue;
  await db.transaction(async (tx) => {
    if (setArt) await tx.update(campaigns).set({ mapArt: world.mapArt! }).where(eq(campaigns.id, c.id));
    for (const f of fills) {
      await tx.update(locations).set({ mapX: f.x, mapY: f.y }).where(and(eq(locations.id, f.id), isNull(locations.mapX)));
    }
  });
}
await pool.end();
