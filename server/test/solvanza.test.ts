import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, npcs, playerCharacter, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { solvanza } from '../src/db/seed/worlds/solvanza';

// Solvanza: an exile's climb from Outlander, a permanent origin choice, Sea-Wren rivals, and four factions.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (includeCharacter = true) => createFromTemplate(t.db, 'solvanza', { name: `Solvanza test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const pick = (option: string): Step[] => [{ tools: [{ name: 'lock_choice', input: { option } }] }, { text: 'The clerk writes it down.' }];

/** Each origin's id, the skill it grants, and its first item. */
const ORIGINS = solvanza.choices![0]!.options.map((o) => ({ id: o.id, label: o.label, skill: o.grants!.skills![0]!.name, item: o.grants!.items![0]!.name }));
const rivals = async (id: string) =>
  (await t.db.select().from(npcs).where(eq(npcs.campaignId, id)))
    .filter((n) => n.shortDescription.startsWith('Sea-Wren exile ('))
    .map((n) => /^Sea-Wren exile \(([^)]+)\)/.exec(n.shortDescription)![1])
    .sort();

describe('Solvanza', () => {
  it('starts on the Customs Quay as an Outlander with a ledger, a pending origin, and four factions at 0', async () => {
    const id = await newCampaign();
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('The Customs Quay');
    expect(pc).toMatchObject({ money: 85, level: 1 });
    expect(pc!.statusEffects.map((e) => e.name)).toEqual(['Station', 'Ledger']);
    expect(pc!.statusEffects[0]!.description).toMatch(/^Outlander/);
    expect(state.campaign).toMatchObject({
      currencyName: 'ducats',
      reputation: { 'The Crown': 0, 'The Golden Houses': 0, 'The Concord of Guilds': 0, 'The Velvet Hand': 0 },
    });

    const [choice] = state.campaign.choices;
    expect(choice).toMatchObject({ key: 'origin', chosen: null });
    expect(choice!.options.map((o) => o.label)).toEqual(['EXILED HEIR', "MERCHANT'S FACTOR", 'SELLSWORD', 'SMUGGLER', 'PHYSICIAN', 'INTELLIGENCER']);
    // Who took the paths passed over is the narrator's secret.
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Vesna Kral');
    expect(await rivals(id)).toEqual([]);
  });

  it('gives every tracked faction someone who acts on it, and seeds the brokers of the climb', async () => {
    const id = await newCampaign(false);
    const npcRows = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { name: string; faction: string }[];
    expect(npcRows.map((n) => n.name)).toEqual(expect.arrayContaining(['Nella Orsini', 'Gaspare Rocco', 'Yaro Benesh']));
    for (const faction of Object.keys(solvanza.reputation!)) expect(npcRows.some((n) => n.faction === faction), faction).toBe(true);
  });

  it.each(ORIGINS)('locks $label, grants $skill and the $item, and the five other exiles come into the world', async ({ id: option, skill, item }) => {
    const id = await newCampaign();
    const { calls } = await play(id, `I was a ${option}.`, pick(option));
    const res = JSON.parse(String(toolResultsIn(calls[1]!)[0]!.content));
    expect(res.granted).toContainEqual({ skill, level: 2 });
    expect(res.offscreen).toHaveLength(5);

    expect(await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id))).toEqual(expect.arrayContaining([{ name: skill }]));
    const items = await t.db.select({ name: inventoryItems.name }).from(inventoryItems).where(eq(inventoryItems.campaignId, id));
    expect(items.map((i) => i.name)).toContain(item);
    expect(await rivals(id)).toEqual(ORIGINS.filter((o) => o.id !== option).map((o) => o.label).sort());
  });
});
