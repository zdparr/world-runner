import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, loreEntries, npcs, playerCharacter, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { emptyCrown } from '../src/db/seed/worlds/empty-crown';

// The Empty Crown: no magic, six tracked factions, an origin choice whose passed-over paths become rival founders, and invention rules the narrator always sees.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (includeCharacter = true) => createFromTemplate(t.db, 'empty-crown', { name: `Empty Crown test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const ORIGINS = emptyCrown.choices![0]!.options.map((o) => ({
  id: o.id,
  label: o.label,
  skills: o.grants!.skills!.map((s) => s.name),
  condition: o.grants!.statusEffects![0]!.name,
}));
const rivals = async (id: string) =>
  (await t.db.select().from(npcs).where(eq(npcs.campaignId, id)))
    .filter((n) => n.shortDescription.startsWith('Rival founder ('))
    .map((n) => /^Rival founder \(([^)]+)\)/.exec(n.shortDescription)![1])
    .sort();

describe('The Empty Crown', () => {
  it('starts at the Crooked Ox with no realm, the origin choice pending, and six factions at 0', async () => {
    const id = await newCampaign();
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('The Crooked Ox');
    expect(pc!.statusEffects.map((e) => e.name)).toEqual(['Your Realm']);
    expect(state.campaign.currencyName).toBe('stags');
    expect(Object.keys(state.campaign.reputation)).toHaveLength(6);

    const [origin] = state.campaign.choices;
    expect(origin).toMatchObject({ key: 'origin', chosen: null });
    expect(origin!.options.map((o) => o.label)).toEqual(['EXILED HEIR', 'SELLSWORD CAPTAIN', "MERCHANT'S HEIR", 'FORGEWRIGHT', 'HEDGE SCHOLAR', "FREEHOLDERS' CHAMPION"]);
    // The rival founders are the narrator's secret until they arrive.
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Dagny Hammerhand');
    expect(await rivals(id)).toEqual([]);
  });

  it('gives every tracked faction someone who acts on it, and always shows the narrator the invention and founding rules', async () => {
    const id = await newCampaign(false);
    const npcRows = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { name: string; faction: string }[];
    for (const faction of Object.keys(emptyCrown.reputation!)) expect(npcRows.some((n) => n.faction === faction), faction).toBe(true);

    const always = (await t.db.select().from(loreEntries).where(eq(loreEntries.campaignId, id))).filter((l) => l.alwaysInclude).map((l) => l.title);
    expect(always).toEqual(expect.arrayContaining(['The Rules of Invention', "The World's Technology", 'Founding a Kingdom']));
  });

  it('keeps every granted skill a distinct single word, so lookups never collide', () => {
    const names = [...emptyCrown.character.skills.map((s) => s.name), ...ORIGINS.flatMap((o) => o.skills)];
    for (const n of names) expect(n).toMatch(/^[A-Z][a-z]+$/);
    // Within one character (base skills plus one origin), no name repeats.
    for (const o of ORIGINS) {
      const own = [...emptyCrown.character.skills.map((s) => s.name), ...o.skills];
      expect(new Set(own).size, o.label).toBe(own.length);
    }
  });

  it.each(ORIGINS)('locks $label, grants its skills and $condition, and the five other rival founders enter the Reach', async ({ id: option, label, skills: granted, condition }) => {
    const id = await newCampaign();
    const { calls } = await play(id, `I choose [${label}]`, [{ tools: [{ name: 'lock_choice', input: { option } }] }, { text: 'Hester nods slowly.' }]);
    const res = JSON.parse(String(toolResultsIn(calls[1]!)[0]!.content));
    expect(res.offscreen).toHaveLength(5);

    const rows = await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id));
    expect(rows.map((r) => r.name)).toEqual(expect.arrayContaining(granted));
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    expect(pc!.statusEffects.map((e) => e.name)).toEqual(['Your Realm', condition]);
    expect(await t.db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, id))).not.toHaveLength(0);
    expect(await rivals(id)).toEqual(ORIGINS.filter((o) => o.id !== option).map((o) => o.label).sort());
  });
});
