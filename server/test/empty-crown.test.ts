import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, loreEntries, npcs, playerCharacter, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { emptyCrown } from '../src/db/seed/worlds/empty-crown';

// The Empty Crown: no magic, six tracked factions (three crowns, the League, the See, and the Free Folk), an origin choice whose passed-over paths become rival founders, and invention rules the narrator always sees.

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

  it('shows the Dominion ladder at "No realm yet", and tells the narrator the next stage', async () => {
    const id = await newCampaign();
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.campaign.ladder).toMatchObject({ title: 'Dominion', unranked: 'No realm yet', condition: 'Your Realm', current: null });
    expect(state.campaign.ladder!.stages.map((s) => s.name)).toEqual(['Holding', 'Lordship', 'Domain', 'Kingdom']);

    const { calls } = await play(id, 'Where do I start?', [{ text: 'Rain.' }]);
    const context = (calls[0]!.system as Anthropic.TextBlockParam[])[1]!.text;
    expect(context).toContain('Rank (Dominion, shown to the player): No realm yet; no stage reached yet. Next: Holding (One place that is yours');
  });

  it('moves the Dominion with set_rank, up or down, logs it, and refuses a stage that is not on the ladder', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'The moot chooses me.', [
      {
        tools: [
          { name: 'set_rank', input: { stage: 'holding', reason: 'Thornwick moot swore to you' } },
          { name: 'set_rank', input: { stage: 'Duchy', reason: 'wishful' } },
        ],
      },
      { text: 'Hester raises her cup.' },
    ]);
    const [ok, bad] = toolResultsIn(calls[1]!).map((r) => String(r.content));
    expect(JSON.parse(ok!)).toMatchObject({ Dominion: 'Holding', before: 'No realm yet', next: expect.stringMatching(/^Lordship: /) });
    expect(bad).toMatch(/"Duchy" is not a stage of Dominion\. Stages: Holding, Lordship, Domain, Kingdom/);

    let state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.campaign.ladder!.current).toBe(0);
    const log = (await t.api('GET', `/api/campaigns/${id}/events`)).json() as { items?: { humanReadable: string }[] } | { humanReadable: string }[];
    const entries = Array.isArray(log) ? log : (log.items ?? []);
    expect(entries.map((e) => e.humanReadable)).toContain('Dominion: No realm yet → Holding: Thornwick moot swore to you');

    await play(id, 'Oswin burns the town.', [{ tools: [{ name: 'set_rank', input: { stage: 'Holding', reason: 'still yours' } }] }, { text: 'Smoke.' }]);
    state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.campaign.ladder!.current).toBe(0);

    // Undo puts the ladder back.
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.campaign.ladder!.current).toBeNull();
  });
});
