import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { inventoryItems, npcs, playerCharacter, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { azureMist } from '../src/db/seed/worlds/azure-mist';

// Ascension: Path of the Immortal: a mortal's root test, a permanent dominant root and composition, stone-tested rivals, and four factions.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (includeCharacter = true) => createFromTemplate(t.db, 'azure-mist', { name: `Azure Mist test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const pick = (option: string, choice?: string): Step[] => [
  { tools: [{ name: 'lock_choice', input: choice ? { choice, option } : { option } }] },
  { text: 'The stone glows.' },
];

/** Each root's id, label, the affinity skill it grants, and its jade slip. */
const ROOTS = azureMist.choices![0]!.options.map((o) => ({ id: o.id, label: o.label, skill: o.grants!.skills![0]!.name, item: o.grants!.items![0]!.name }));
const rivals = async (id: string) =>
  (await t.db.select().from(npcs).where(eq(npcs.campaignId, id)))
    .filter((n) => n.shortDescription.startsWith('Stone-tested rival ('))
    .map((n) => /^Stone-tested rival \(([^)]+)\)/.exec(n.shortDescription)![1])
    .sort();

describe('Ascension: Path of the Immortal', () => {
  it('starts in Willowbrook as an untested mortal, with both root choices pending and four factions at 0', async () => {
    const id = await newCampaign();
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('Willowbrook Village');
    expect(pc).toMatchObject({ money: 2, level: 1 });
    expect(pc!.statusEffects.map((e) => e.name)).toEqual(['Spiritual Roots', 'Cultivation Realm']);
    expect(pc!.statusEffects[0]!.description).toMatch(/^Untested/);
    expect(state.campaign).toMatchObject({
      currencyName: 'spirit stones',
      reputation: { 'Azure Cloud Sect': 0, 'Crimson Blade Hall': 0, 'Verdant Pill Pavilion': 0, 'Wandering Immortal Alliance': 0 },
    });

    const [root, composition] = state.campaign.choices;
    expect(root).toMatchObject({ key: 'spiritual_root', chosen: null });
    expect(root!.options.map((o) => o.label)).toEqual(['FIRE', 'WATER', 'EARTH', 'WOOD', 'METAL', 'WIND', 'LIGHTNING', 'ICE']);
    expect(composition).toMatchObject({ key: 'root_composition', chosen: null });
    expect(composition!.options.map((o) => o.label)).toEqual(['PURE ROOT', 'DUAL ROOT', 'MIXED ROOT']);
    // Who the stone lit for elsewhere is the narrator's secret.
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Han Xueyin');
    expect(await rivals(id)).toEqual([]);
  });

  it('gives every tracked faction someone who acts on it, and seeds the cast of the province', async () => {
    const id = await newCampaign(false);
    const npcRows = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { name: string; faction: string }[];
    expect(npcRows.map((n) => n.name)).toEqual(expect.arrayContaining(['Master Lu Feng', 'Granny Wen', 'Peddler Mo', 'The Moon Hermitess']));
    for (const faction of Object.keys(azureMist.reputation!)) expect(npcRows.some((n) => n.faction === faction), faction).toBe(true);
  });

  it.each(ROOTS)('locks $label, grants $skill and the $item, and the seven other stone-tested youths come into the world', async ({ id: option, label, skill, item }) => {
    const id = await newCampaign();
    const { calls } = await play(id, `I choose [${label}]`, pick(option));
    const res = JSON.parse(String(toolResultsIn(calls[1]!)[0]!.content));
    expect(res.granted).toContainEqual({ skill, level: 1 });
    expect(res.offscreen).toHaveLength(7);

    expect(await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id))).toEqual(expect.arrayContaining([{ name: skill }]));
    const items = await t.db.select({ name: inventoryItems.name }).from(inventoryItems).where(eq(inventoryItems.campaignId, id));
    expect(items.map((i) => i.name)).toContain(item);
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    expect(pc!.statusEffects.find((e) => e.name === 'Spiritual Roots')!.description).toMatch(new RegExp(`^Dominant root: ${skill.split(' ')[0]}`));
    expect(await rivals(id)).toEqual(ROOTS.filter((r) => r.id !== option).map((r) => r.label).sort());
  });

  it('locks the composition next, trading breakthrough ease against breadth', async () => {
    const pure = await newCampaign();
    await play(pure, 'I choose [WIND]', pick('wind'));
    await play(pure, 'I choose [PURE ROOT]', pick('pure'));
    const mixed = await newCampaign();
    await play(mixed, 'I choose [EARTH]', pick('earth'));
    await play(mixed, 'I choose [MIXED ROOT]', pick('mixed', 'root_composition'));

    const composition = async (id: string) => {
      const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
      return pc!.statusEffects.find((e) => e.name === 'Root Composition')!;
    };
    expect((await composition(pure)).modifiers).toEqual([{ target: 'Qi Cultivation', bonus: 1 }]);
    expect((await composition(mixed)).modifiers).toEqual([{ target: 'Qi Cultivation', bonus: -1 }]);

    const state = (await t.api('GET', `/api/campaigns/${pure}/state`)).json() as CampaignState;
    expect(state.campaign.choices.map((c) => c.chosen)).toEqual(['wind', 'pure']);
  });
});
