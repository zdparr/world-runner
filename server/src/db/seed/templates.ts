import { eq } from 'drizzle-orm';
import type { Db } from '../client';
import { campaigns } from '../schema';
import { insertWorld, type WorldTemplate } from './world';
import { brinecross } from './worlds/brinecross';
import { fiveBanners } from './worlds/five-banners';
import { harrowmere } from './worlds/harrowmere';
import { threshold } from './worlds/threshold';
import { varenhold } from './worlds/varenhold';

/** Ready-made worlds a new campaign can start from. The first is the default demo. */
export const TEMPLATES: WorldTemplate[] = [varenhold, brinecross, harrowmere, fiveBanners, threshold];

export function findTemplate(id: string): WorldTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Create a campaign from a template, optionally with its pre-made character. */
export async function createFromTemplate(
  db: Db,
  templateId: string,
  opts: { name: string; includeCharacter: boolean },
): Promise<string> {
  const world = findTemplate(templateId);
  if (!world) throw new Error(`Unknown template "${templateId}"`);
  return db.transaction((tx) => insertWorld(tx, world, opts));
}

/**
 * Create a template's demo campaign (with its pre-made character).
 * Returns the id, or null if it already exists and `reset` is false.
 */
export async function seedDemoCampaign(
  db: Db,
  { templateId = TEMPLATES[0]!.id, reset = false }: { templateId?: string; reset?: boolean } = {},
): Promise<string | null> {
  const world = findTemplate(templateId);
  if (!world) throw new Error(`Unknown template "${templateId}". Available: ${TEMPLATES.map((t) => t.id).join(', ')}`);
  return db.transaction(async (tx) => {
    const existing = await tx.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.name, world.demoCampaignName));
    if (existing.length > 0) {
      if (!reset) return null;
      // Every campaign-scoped table cascades from campaigns.
      await tx.delete(campaigns).where(eq(campaigns.name, world.demoCampaignName));
    }
    return insertWorld(tx, world, { name: world.demoCampaignName, includeCharacter: true });
  });
}
