import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, npcs, playerCharacter, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { spire } from '../src/db/seed/worlds/spire';

// The Hundred-Floor Spire: a permanent Chosen skill, five rival Chosen already climbing, and four factions.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (includeCharacter = true) => createFromTemplate(t.db, 'spire', { name: `Spire test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const pick = (option: string): Step[] => [{ tools: [{ name: 'lock_choice', input: { option } }] }, { text: 'You fall into white light.' }];

const SKILLS = { blink: 'Blink', onslaught: 'Onslaught', rewind: 'Rewind', legion: 'Legion', thousand_blades: 'Thousand Blades', heartforge: 'Heartforge' };

const rivalSkills = async (id: string) =>
  (await t.db.select().from(npcs).where(eq(npcs.campaignId, id)))
    .filter((n) => n.shortDescription.startsWith('Chosen ('))
    .map((n) => /^Chosen \(([^)]+)\)/.exec(n.shortDescription)![1])
    .sort();

describe('The Hundred-Floor Spire', () => {
  it('starts at the Foot of the Spire with no shards, a progress marker, a pending skill choice, and four factions at 0', async () => {
    const id = await newCampaign();
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('The Foot of the Spire');
    expect(pc).toMatchObject({ money: 0, level: 1, hp: 12 });
    expect(pc!.statusEffects.map((e) => e.name)).toEqual(['Spire Progress']);
    expect(state.campaign).toMatchObject({
      ruleset: 'ascension',
      currencyName: 'shards',
      reputation: { 'Crown of Halvane': 0, "Climbers' Lodge": 0, 'Order of the Unbroken Stair': 0, 'Gilded Ascent': 0 },
    });

    const [choice] = state.campaign.choices;
    expect(choice).toMatchObject({ key: 'chosen_skill', chosen: null });
    expect(choice!.options.map((o) => o.label)).toEqual(['BLINK', 'ONSLAUGHT', 'REWIND', 'LEGION', 'THOUSAND BLADES', 'HEARTFORGE']);
    // Who holds the passed-over skills is the narrator's secret.
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Ilse Varga');
  });

  it('seeds the rest-point keepers and gives every tracked faction someone who acts on it', async () => {
    const id = await newCampaign(false);
    const npcRows = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { name: string; faction: string }[];
    expect(npcRows.map((n) => n.name)).toEqual(expect.arrayContaining(['The Broker', 'Pip']));
    for (const faction of Object.keys(spire.reputation!)) expect(npcRows.some((n) => n.faction === faction), faction).toBe(true);
  });

  it.each(Object.entries(SKILLS))('locks %s, grants it, and brings in the five rivals holding the others', async (option, skill) => {
    const id = await newCampaign();
    const { calls } = await play(id, `I choose ${skill}.`, pick(option));
    const res = JSON.parse(String(toolResultsIn(calls[1]!)[0]!.content));
    expect(res.granted).toContainEqual({ skill, level: 1 });
    expect(res.offscreen).toHaveLength(5);

    expect(await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id))).toEqual(
      expect.arrayContaining([{ name: skill }]),
    );
    expect(await rivalSkills(id)).toEqual(Object.values(SKILLS).filter((s) => s !== skill).sort());
  });

  it('puts the Ember Brand in the inventory when Heartforge is chosen', async () => {
    const id = await newCampaign();
    await play(id, 'I choose [HEARTFORGE].', pick('heartforge'));
    const items = await t.db.select({ name: inventoryItems.name }).from(inventoryItems).where(eq(inventoryItems.campaignId, id));
    expect(items.map((i) => i.name)).toContain('Ember Brand');
  });
});
