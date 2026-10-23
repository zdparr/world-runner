import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, npcs, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { harrowmere } from '../src/db/seed/worlds/harrowmere';

// Harrowmere: a permanent wand choice, rival wandbearers, spells as skills, and four factions at war.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = () => createFromTemplate(t.db, 'harrowmere', { name: `Harrowmere test ${++seq}`, includeCharacter: true });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const result = (call: Anthropic.MessageStreamParams, i = 0) => toolResultsIn(call)[i]!;
const pick = (option: string): Step[] => [{ tools: [{ name: 'lock_choice', input: { option } }] }, { text: 'The wand warms in your hand.' }];

/** Each wand's id, the wand item it grants, and its signature spell. */
const WANDS = harrowmere.choices![0]!.options.map((o) => ({ id: o.id, wand: o.grants!.items![0]!.name, spell: o.grants!.skills![0]!.name }));
const wandbearers = async (id: string) =>
  (await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).filter((n) => n.shortDescription.startsWith('Wandbearer'));

describe('Harrowmere', () => {
  it('starts in the wandwright with a pending wand choice, no spells, and four factions at 0', async () => {
    const id = await newCampaign();
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('Marchetti & Daughters, Wandwrights');
    expect(state.campaign.reputation).toEqual({ 'Charter Wardens': 0, 'Aldgrave Society': 0, 'The Tidebound': 0, 'The Tallymen': 0 });
    const [choice] = state.campaign.choices;
    expect(choice).toMatchObject({ key: 'wand', chosen: null });
    expect(choice!.options.map((o) => o.label)).toEqual([
      'ROWAN & STORMGLASS',
      'BLACKTHORN & RAVEN QUILL',
      'HAWTHORN & SEAL WHISKER',
      'YEW & PIER NINE EMBER',
      'DRIFTWOOD & HARBOR PEARL',
      'IRONWOOD & LODESTONE',
    ]);
    // No spell yet: the wand brings the first one.
    expect(state.skills.map((s) => s.name).filter((n) => WANDS.some((w) => w.spell === n))).toEqual([]);
    expect(state.items.some((i) => i.tags.includes('wand'))).toBe(false);
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Kit Hask');
    expect(await wandbearers(id)).toEqual([]);
  });

  it('gives every tracked faction someone in the world who acts on it', async () => {
    for (const faction of Object.keys(harrowmere.reputation!)) expect(harrowmere.npcs.some((n) => n.faction === faction), faction).toBe(true);
  });

  it.each(WANDS)('grants the $wand and $spell, and the five wands passed over go to rivals ($id)', async ({ id: option, wand, spell }) => {
    const id = await newCampaign();
    const { calls } = await play(id, `I choose ${option}.`, pick(option));
    expect(JSON.parse(String(result(calls[1]!).content))).toMatchObject({ granted: expect.arrayContaining([{ skill: spell, level: 1 }]) });

    const items = await t.db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, id));
    expect(items.filter((i) => i.tags.includes('wand')).map((i) => i.name)).toEqual([wand]);
    const owned = (await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id))).map((s) => s.name);
    expect(owned.filter((n) => WANDS.some((w) => w.spell === n))).toEqual([spell]);

    const held = (await wandbearers(id)).map((n) => /^Wandbearer \(([^)]+)\)/.exec(n.shortDescription)![1]).sort();
    expect(held).toEqual(WANDS.filter((w) => w.id !== option).map((w) => w.wand.replace(/ wand$/, '')).sort());
  });
});
