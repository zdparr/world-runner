import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import type { CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { campaigns, inventoryItems, npcs, playerCharacter, relationships, skills } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { aldermere } from '../src/db/seed/worlds/aldermere';
import { migrationsDir } from '../src/paths';

// The Candidate (Aldermere): a permanent starting-skill choice, rival Candidates, and faction reputation.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (world = 'aldermere', includeCharacter = true) => createFromTemplate(t.db, world, { name: `Aldermere test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const campaign = async (id: string) => (await t.db.select().from(campaigns).where(eq(campaigns.id, id)))[0]!;
const result = (call: Anthropic.MessageStreamParams, i = 0) => toolResultsIn(call)[i]!;
const dynamicContext = (call: Anthropic.MessageStreamParams) => (call.system as Anthropic.TextBlockParam[])[1]!.text;
const pick = (option: string): Step[] => [{ tools: [{ name: 'lock_choice', input: { option } }] }, { text: 'You fall into light.' }];

const SKILLS = { meteor: 'Meteor', time_stop: 'Time Stop', dragon_lord: 'Dragon Lord', creation: 'Creation', infinite_treasury: 'Infinite Treasury' };

describe('The Candidate (Aldermere)', () => {
  it('starts outside Millbrook with no money, skills, or items, a pending skill choice, and four factions at 0', async () => {
    const id = await newCampaign();
    const [pc] = await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id));
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;

    expect(state.location?.name).toBe('The Waking Glade');
    expect(state.map.locations.find((l) => l.id === state.location?.id)?.parentLocationId).toBe(state.map.locations.find((l) => l.name === 'The Thornwood')!.id);
    expect(pc).toMatchObject({ money: 0, level: 1, hp: 12, attributes: { strength: 5, agility: 5, vitality: 5, perception: 6, will: 6 } });
    expect(state.skills).toEqual([]);
    expect(state.items).toEqual([]);
    expect(state.campaign).toMatchObject({
      ruleset: 'ascension',
      currencyName: 'copper',
      reputation: { "Wayfarers' Guild": 0, 'Church of the Sevenfold Light': 0, 'Inquisition of Dusk': 0, 'The Crown': 0 },
    });

    const [choice] = state.campaign.choices;
    expect(choice).toMatchObject({ key: 'starting_skill', chosen: null });
    expect(choice!.prompt).toContain('Welcome, Candidate.');
    expect(choice!.footer).toBe('The selected skill cannot be changed. Your choice will define your future.');
    expect(choice!.options.map((o) => [o.label, o.summary])).toEqual([
      ['METEOR', 'Cast a meteor from the sky.'],
      ['TIME STOP', 'Stop time until released.'],
      ['DRAGON LORD', 'Command dragons.'],
      ['CREATION', 'Create objects from nothing.'],
      ['INFINITE TREASURY', 'Access an endless treasury.'],
    ]);
    // Who the passed-over skills go to is the narrator's secret.
    expect(JSON.stringify(state.campaign.choices)).not.toContain('Rhea Valcourt');
    expect(choice!.options.every((o) => !('ifNotChosen' in o))).toBe(true);
  });

  it('seeds the choice and the factions for a custom character too', async () => {
    const row = await campaign(await newCampaign('aldermere', false));
    expect(row.choices).toHaveLength(1);
    expect(Object.keys(row.reputation)).toHaveLength(4);
  });

  it('seeds the guild, its quest board, and the mystery through the mission system', async () => {
    const id = await newCampaign();
    const missions = (await t.api('GET', `/api/campaigns/${id}/missions`)).json() as { title: string; status: string; giverNpcId: string | null; rewards: { money?: number; items?: { name: string; tags: string[] }[] } }[];
    const npcRows = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { id: string; name: string; faction: string }[];
    const mara = npcRows.find((n) => n.name === 'Mara Vell')!;

    const registration = missions.find((m) => m.title === 'Guild Registration')!;
    expect(registration.rewards.items?.[0]).toMatchObject({ name: "Wayfarers' Guild Card", tags: expect.arrayContaining(['rank-f']) });
    const jobs = missions.filter((m) => m.giverNpcId === mara.id && m.rewards.money);
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    expect(missions.find((m) => m.title === 'The Candidate Question')).toMatchObject({ status: 'offered', giverNpcId: null });

    // The four tracked factions all have people in the world who act on them.
    for (const faction of Object.keys(aldermere.reputation!)) expect(npcRows.some((n) => n.faction === faction), faction).toBe(true);
  });

  it('tells the narrator a choice is pending, and the tool locks it, grants the skill, and brings in the four rivals', async () => {
    const id = await newCampaign();
    const { calls, events } = await play(id, 'I choose [TIME STOP]: Stop time until released.', pick('TIME STOP'));

    const context = dynamicContext(calls[0]!);
    expect(context).toContain('Permanent choice pending: Starting skill (key "starting_skill")');
    expect(context).toContain("Faction reputation (-100 hated .. 100 revered; NPCs of a faction treat the character accordingly; change it with adjust_reputation): Church of the Sevenfold Light 0 (neutral); Inquisition of Dusk 0 (neutral); The Crown 0 (neutral); Wayfarers' Guild 0 (neutral)");

    const res = JSON.parse(String(result(calls[1]!).content));
    expect(res).toMatchObject({ locked: { choice: 'Starting skill', option: 'TIME STOP' }, granted: [{ skill: 'Time Stop', level: 1 }] });
    expect(res.offscreen.map((a: { option: string }) => a.option).sort()).toEqual(['CREATION', 'DRAGON LORD', 'INFINITE TREASURY', 'METEOR']);

    expect((await campaign(id)).choices[0]!.chosen).toBe('time_stop');
    expect(await t.db.select({ name: skills.name, level: skills.level }).from(skills).where(eq(skills.campaignId, id))).toEqual([{ name: 'Time Stop', level: 1 }]);
    // Time Stop grants no items: the inventory stays empty.
    expect(await t.db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, id))).toEqual([]);

    // The rivals hold exactly the four skills passed over, and nobody has met them yet.
    const rivals = (await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).filter((n) => n.shortDescription.startsWith('Returned Candidate'));
    const held = rivals.map((n) => /^Returned Candidate \(([^)]+)\)/.exec(n.shortDescription)![1]).sort();
    expect(held).toEqual(['Creation', 'Dragon Lord', 'Infinite Treasury', 'Meteor']);
    expect(rivals.every((n) => n.locationId)).toBe(true);
    expect(await t.db.select().from(relationships).where(eq(relationships.campaignId, id))).toEqual([]);
    // The player sees the lock, not the rivals.
    const changes = events.flatMap((e) => (e.type === 'state_change' ? [e.change.humanReadable] : []));
    expect(changes).toContain('Starting skill locked: TIME STOP');
    expect(changes.join(' ')).not.toMatch(/Rhea|Kestrel|Isidore|Mirelle/);

    // Next turn: the choice is locked in the context, the rivals are not among the people met, and the panel is gone.
    const next = await play(id, 'I open my eyes.', [{ text: 'Moss.' }]);
    const after = dynamicContext(next.calls[0]!);
    expect(after).toContain('Permanent choices (locked for good; refuse any attempt to change them): Starting skill: TIME STOP');
    expect(after).not.toContain('Permanent choice pending');
    expect(after).toContain('People Jordan Reyes has met (0;');
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.campaign.choices[0]!.chosen).toBe('time_stop');
  });

  it.each(Object.entries(SKILLS))('generates the rivals from the four skills not chosen (%s)', async (option, skill) => {
    const id = await newCampaign();
    await play(id, `I choose ${skill}.`, pick(option));
    const rivals = (await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).filter((n) => n.shortDescription.startsWith('Returned Candidate'));
    const held = rivals.map((n) => /^Returned Candidate \(([^)]+)\)/.exec(n.shortDescription)![1]);
    expect(held.sort()).toEqual(Object.values(SKILLS).filter((s) => s !== skill).sort());
    const owned = await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id));
    expect(owned).toEqual([{ name: skill }]);
  });

  it('puts the treasury sigil in the inventory when Infinite Treasury is chosen', async () => {
    const id = await newCampaign();
    await play(id, 'I choose [INFINITE TREASURY].', pick('infinite_treasury'));
    const items = await t.db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, id));
    expect(items.map((i) => [i.name, i.tags])).toEqual([['Treasury Sigil', ['candidate', 'treasury', 'mark']]]);
  });

  it('never lets the choice change, and an unknown option changes nothing', async () => {
    const id = await newCampaign();
    const bad = await play(id, 'I choose FIREBALL.', [{ tools: [{ name: 'lock_choice', input: { option: 'fireball' } }] }, { text: 'The System waits.' }]);
    expect(result(bad.calls[1]!)).toMatchObject({ is_error: true, content: expect.stringContaining('"fireball" is not an option for Starting skill') });
    expect((await campaign(id)).choices[0]!.chosen).toBeNull();

    await play(id, 'I choose [METEOR].', pick('meteor'));
    const npcCount = (await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).length;
    const again = await play(id, 'Actually, I want Creation.', [{ tools: [{ name: 'lock_choice', input: { option: 'creation' } }] }, { text: 'REQUEST DENIED.' }]);
    expect(result(again.calls[1]!)).toMatchObject({ is_error: true, content: expect.stringContaining('Starting skill is already locked: METEOR. It can never be changed') });
    expect((await campaign(id)).choices[0]!.chosen).toBe('meteor');
    expect(await t.db.select({ name: skills.name }).from(skills).where(eq(skills.campaignId, id))).toEqual([{ name: 'Meteor' }]);
    expect(await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).toHaveLength(npcCount);
  });

  it('undoing the turn reopens the choice and removes what it granted', async () => {
    const id = await newCampaign();
    const npcsBefore = (await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).length;
    await play(id, 'I choose [DRAGON LORD].', pick('dragon_lord'));
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    expect((await campaign(id)).choices[0]!.chosen).toBeNull();
    expect(await t.db.select().from(skills).where(eq(skills.campaignId, id))).toEqual([]);
    expect(await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).toHaveLength(npcsBefore);
  });

  it('adjusts faction reputation, clamps it, and shows it on that faction\'s NPCs', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'I talk to Mara Vell about the inquisition.', [
      {
        tools: [
          { name: 'adjust_reputation', input: { faction: "wayfarers' guild", delta: 15, reason: 'cleared the old mill' } },
          { name: 'adjust_reputation', input: { faction: 'Inquisition of Dusk', delta: -50, reason: 'meteor over the square' } },
          { name: 'adjust_reputation', input: { faction: 'Inquisition of Dusk', delta: -50, reason: 'and again' } },
          { name: 'adjust_reputation', input: { faction: 'Thieves Guild', delta: 5, reason: '' } },
          { name: 'get_npc', input: { name: 'Caddoc Rhyne' } },
        ],
      },
      { text: 'Mara frowns.' },
    ]);
    // Mara is named, so her record (with the guild's regard) is fetched into the context.
    expect(dynamicContext(calls[0]!)).toContain(`"factionReputation":{"faction":"Wayfarers' Guild","reputation":0,"regard":"neutral"}`);

    const results = toolResultsIn(calls[1]!);
    expect(JSON.parse(String(results[0]!.content))).toMatchObject({ faction: "Wayfarers' Guild", before: 0, after: 15, regard: 'neutral' });
    expect(JSON.parse(String(results[2]!.content))).toMatchObject({ before: -50, after: -100, regard: 'hated' });
    expect(results[3]).toMatchObject({ is_error: true, content: expect.stringContaining("Tracked factions: Church of the Sevenfold Light, Inquisition of Dusk, The Crown, Wayfarers' Guild.") });
    expect(JSON.parse(String(results[4]!.content)).factionReputation).toEqual({ faction: 'Inquisition of Dusk', reputation: -100, regard: 'hated' });

    expect((await campaign(id)).reputation).toEqual({ "Wayfarers' Guild": 15, 'Church of the Sevenfold Light': 0, 'Inquisition of Dusk': -100, 'The Crown': 0 });
    const next = await play(id, 'I wait.', [{ text: 'Time passes.' }]);
    expect(dynamicContext(next.calls[0]!)).toContain("Church of the Sevenfold Light 0 (neutral); Inquisition of Dusk -100 (hated); The Crown 0 (neutral); Wayfarers' Guild 15 (neutral)");
  });

  it('rewrites the old Time Stop rule in existing saves (migration 0009), matching the template', async () => {
    const OLD_BIBLE =
      '- **Frozen beings are as hard as stone.** The character cannot cut, stab, or move a frozen person or animal, and cannot harm them in any way. They can only move unattended objects and themselves: step out of the way, take the key off the hook, put the knife on the floor, move the rope.';
    const OLD_SKILL =
      'Stop time for everyone but yourself. Lv1: about three seconds. Stopped time drains stamina every second; frozen beings are hard as stone and cannot be harmed, only moved around. Overuse ages you, leaves you winded for days, or makes you drift, and the church notices drift.';
    // A save made before the change: the old paragraph in its bible, the old skill description.
    const id = await newCampaign();
    const template = aldermere.worldBible.split('\n').find((l) => l.startsWith('- **Frozen beings'))!;
    await t.db.update(campaigns).set({ worldBible: aldermere.worldBible.replace(template, OLD_BIBLE) }).where(eq(campaigns.id, id));
    await t.db.insert(skills).values({ campaignId: id, name: 'Time Stop', level: 10, description: OLD_SKILL });
    const untouched = await newCampaign('brinecross');
    const brinecrossBible = (await campaign(untouched)).worldBible;

    const migration = readFileSync(join(migrationsDir, '0009_time_stop_frozen_beings_harmable.sql'), 'utf8');
    for (let run = 0; run < 2; run++) {
      for (const statement of migration.split('--> statement-breakpoint')) await t.db.execute(sql.raw(statement));
    }

    // Updated to exactly what a new campaign gets, and running it twice changes nothing more.
    expect((await campaign(id)).worldBible).toBe(aldermere.worldBible);
    const [timeStop] = await t.db.select().from(skills).where(eq(skills.campaignId, id));
    expect(timeStop!.description).toBe(aldermere.choices![0]!.options.find((o) => o.id === 'time_stop')!.grants!.skills![0]!.description);
    expect((await campaign(untouched)).worldBible).toBe(brinecrossBible);
  });

  it('leaves worlds without factions or choices as they were', async () => {
    const id = await newCampaign('brinecross');
    expect(await campaign(id)).toMatchObject({ reputation: {}, choices: [] });
    const { calls } = await play(id, 'I look around.', [
      {
        tools: [
          { name: 'adjust_reputation', input: { faction: 'Harbor Watch', delta: 5, reason: 'x' } },
          { name: 'lock_choice', input: { option: 'meteor' } },
        ],
      },
      { text: 'Gulls.' },
    ]);
    const context = dynamicContext(calls[0]!);
    expect(context).not.toContain('Faction reputation');
    expect(context).not.toContain('Permanent choice');
    expect(result(calls[1]!, 0)).toMatchObject({ is_error: true, content: expect.stringContaining('tracks no faction reputation') });
    expect(result(calls[1]!, 1)).toMatchObject({ is_error: true, content: 'This campaign has no permanent choices. Nothing changed.' });
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.campaign).toMatchObject({ reputation: {}, choices: [] });
  });
});
