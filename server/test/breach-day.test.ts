import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, npcs, playerCharacter, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { breachDay } from '../src/db/seed/worlds/breach-day';

// Breach Day: one unique Power from a slate of eight, seven neighbors holding the rest, a two-year countdown, and four factions.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (includeCharacter = true) => createFromTemplate(t.db, 'breach-day', { name: `Breach Day test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const pick = (option: string): Step[] => [{ tools: [{ name: 'lock_choice', input: { option } }] }, { text: 'Time starts again.' }];

const POWERS = {
  bastion: 'Bastion',
  foresight: 'Foresight',
  beastbond: 'Beastbond',
  stockpile: 'Stockpile',
  juggernaut: 'Juggernaut',
  mending: 'Mending',
  stormcaller: 'Stormcaller',
  coresmith: 'Coresmith',
};

const holderPowers = async (id: string) =>
  (await t.db.select().from(npcs).where(eq(npcs.campaignId, id)))
    .map((n) => /^Power: ([A-Z]+)\./.exec(n.shortDescription)?.[1])
    .filter((p): p is string => !!p)
    .sort();

describe('Breach Day', () => {
  it('starts at home on Day 1 with savings, a pending Power choice, and four factions at 0', async () => {
    const id = await newCampaign();
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('Your Apartment');
    expect(pc).toMatchObject({ money: 4200, level: 1, hp: 12 });
    expect(state.campaign).toMatchObject({
      ruleset: 'ascension',
      currencyName: 'dollars',
      gameDay: 1,
      reputation: { 'Breach Preparedness Command': 0, 'Meridian Ark': 0, 'The Open Door': 0, 'KC Commons': 0 },
    });

    const [choice] = state.campaign.choices;
    expect(choice).toMatchObject({ key: 'power', chosen: null });
    expect(choice!.options.map((o) => o.label)).toEqual(Object.values(POWERS).map((p) => p.toUpperCase()));
    // Who holds the passed-over Powers is the narrator's secret.
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Delphine Okoye');
  });

  it('seeds the neighbors and gives every tracked faction someone who acts on it', async () => {
    const id = await newCampaign(false);
    const npcRows = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { name: string; faction: string }[];
    expect(npcRows.map((n) => n.name)).toEqual(expect.arrayContaining(['Pearl Whitaker', 'Devin Cole', 'Maya']));
    for (const faction of Object.keys(breachDay.reputation!)) expect(npcRows.some((n) => n.faction === faction), faction).toBe(true);
  });

  it.each(Object.entries(POWERS))('locks %s, grants it, and brings in the seven people holding the others', async (option, power) => {
    const id = await newCampaign();
    const { calls } = await play(id, `I claim ${power}.`, pick(option));
    const res = JSON.parse(String(toolResultsIn(calls[1]!)[0]!.content));
    expect(res.granted).toContainEqual({ skill: power, level: 1 });
    expect(res.offscreen).toHaveLength(7);

    expect(await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id))).toEqual(
      expect.arrayContaining([{ name: power }]),
    );
    expect(await holderPowers(id)).toEqual(
      Object.values(POWERS)
        .filter((p) => p !== power)
        .map((p) => p.toUpperCase())
        .sort(),
    );
  });

  it('puts the Stockpile Mark in the inventory when Stockpile is claimed', async () => {
    const id = await newCampaign();
    await play(id, 'I claim [STOCKPILE].', pick('stockpile'));
    const items = await t.db.select({ name: inventoryItems.name }).from(inventoryItems).where(eq(inventoryItems.campaignId, id));
    expect(items.map((i) => i.name)).toContain('Stockpile Mark');
  });
});
