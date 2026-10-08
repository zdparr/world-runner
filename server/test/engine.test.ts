import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { and, asc, eq, sql } from 'drizzle-orm';
import { createTestApp } from './helpers';
import { doneEvent, parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import {
  campaigns,
  inventoryItems,
  locations,
  messages,
  missions,
  npcs,
  playerCharacter,
  relationships,
  skills,
  stateEvents,
  turnDebug,
} from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { buildTurnContext } from '../src/engine/context';
import { migrationsDir } from '../src/paths';

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
// The engine tests play in Brinecross (its numbers are baked into the assertions).
const newCampaign = (includeCharacter = true) =>
  createFromTemplate(t.db, 'brinecross', { name: `Engine test ${++seq}`, includeCharacter });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  return { res, events: parseSse(res.body), calls: model.calls };
}

const character = async (id: string) => (await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id)))[0]!;
const lastError = (events: { type: string }[]) => events.find((e) => e.type === 'error');

// ---------------------------------------------------------------- the turn pipeline

describe('a turn', () => {
  it('streams narration, runs tools, persists everything, and reports state changes', async () => {
    const id = await newCampaign();
    const { res, events, calls } = await play(id, 'I pay the fishwife for a hot pie.', [
      { tools: [{ name: 'get_money', input: {} }] },
      { text: 'You hand over the coins. ', tools: [{ name: 'adjust_money', input: { delta: -2, reason: 'hot pie' } }, { name: 'add_item', input: { name: 'Hot eel pie', tags: ['food'] } }] },
      { text: 'The pie is scalding and wonderful. What now?' },
    ]);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
    expect(events.map((e) => e.type)).toEqual(expect.arrayContaining(['turn_start', 'text', 'tool', 'state_change', 'done']));
    expect(events.at(-1)!.type).toBe('done');

    const done = doneEvent(events);
    expect(done.narration).toBe('You hand over the coins. The pie is scalding and wonderful. What now?');
    expect(done.stateChanges.map((c) => c.humanReadable)).toEqual(['-2 crowns (hot pie)', '+1 Hot eel pie']);
    expect(done.usage.rounds).toBe(3);

    // The model was told the real balance and the write results.
    expect(JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string)).toEqual({ money: 40, currency: 'crowns' });
    expect(JSON.parse(toolResultsIn(calls[2]!)[0]!.content as string)).toMatchObject({ delta: -2, balance: 38 });

    expect((await character(id)).money).toBe(38);
    const stored = await t.db.select().from(messages).where(eq(messages.campaignId, id)).orderBy(asc(messages.id));
    expect(stored.map((m) => [m.turnNumber, m.role])).toEqual([
      [1, 'player'],
      [1, 'narrator'],
    ]);
    const [campaign] = await t.db.select().from(campaigns).where(eq(campaigns.id, id));
    expect(campaign!.turnCount).toBe(1);
    const [debug] = await t.db.select().from(turnDebug).where(eq(turnDebug.campaignId, id));
    expect((debug!.toolCalls as unknown[]).length).toBe(3);
    expect(debug!.contextManifest).toMatchObject({ loadedByTools: [{ tool: 'get_money' }] });
  });

  it('sends a stable, cache-marked prefix so repeat turns can hit the cache', async () => {
    const id = await newCampaign();
    const a = await play(id, 'I look around.', [{ text: 'Gulls wheel overhead.' }]);
    const b = await play(id, 'I keep walking.', [{ text: 'The crowd thickens.' }]);
    const [first, second] = [a.calls[0]!, b.calls[0]!];

    const system = first.system as Anthropic.TextBlockParam[];
    expect(system[0]!.cache_control).toEqual({ type: 'ephemeral' });
    // Tools and the cached system block are byte-identical across turns.
    expect(JSON.stringify(second.tools)).toBe(JSON.stringify(first.tools));
    expect((second.system as Anthropic.TextBlockParam[])[0]!.text).toBe(system[0]!.text);
    // The conversation tail is marked too (reused by the next tool round).
    const tail = second.messages.at(-1)!.content as Anthropic.TextBlockParam[];
    expect(tail.at(-1)!.cache_control).toEqual({ type: 'ephemeral' });
    // Turn 2 sees turn 1 as history.
    expect(second.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(first.thinking).toEqual({ type: 'adaptive' });
  });

  it('refuses to start without a character', async () => {
    const id = await newCampaign(false);
    t.setModel(scriptedModel([]).stream);
    const res = await t.api('POST', `/api/campaigns/${id}/turns`, { content: 'Hello?' });
    expect(res.statusCode).toBe(409);
  });
});

// ---------------------------------------------------------------- tool validation and invariants

describe('write tools', () => {
  it('never lets money go negative', async () => {
    const id = await newCampaign();
    const { events, calls } = await play(id, 'I buy the ship.', [
      { tools: [{ name: 'adjust_money', input: { delta: -5000, reason: 'a ship' } }] },
      { text: 'The shipwright laughs at your purse.' },
    ]);
    const [result] = toolResultsIn(calls[1]!);
    expect(result!.is_error).toBe(true);
    expect(result!.content).toMatch(/Not enough money: the character has 40 crowns/);
    expect((await character(id)).money).toBe(40);
    expect(doneEvent(events).stateChanges).toEqual([]);
  });

  it('rejects invalid tool input with a message the model can act on', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'I train.', [
      { tools: [{ name: 'grant_skill_xp', input: { skill_name: 'Stealth', amount: 'lots' } }, { name: 'no_such_tool', input: {} }] },
      { tools: [{ name: 'grant_skill_xp', input: { skill_name: 'Stealth', amount: 20, reason: 'training' } }] },
      { text: 'Hours in the shadows pay off.' },
    ]);
    const [bad, unknown] = toolResultsIn(calls[1]!);
    expect(bad!.is_error).toBe(true);
    expect(bad!.content).toMatch(/Invalid input for grant_skill_xp: amount: .*Fix the arguments/);
    expect(unknown!.content).toMatch(/Unknown tool "no_such_tool"/);
    expect(JSON.parse(toolResultsIn(calls[2]!)[0]!.content as string)).toMatchObject({ skill: 'Stealth', level: 2, xp: 35 });
  });

  it('clamps relationship values and appends to history notes', async () => {
    const id = await newCampaign();
    const { calls, events } = await play(id, 'I save Mara from the fire.', [
      { tools: [{ name: 'adjust_relationship', input: { npc_name: 'Mara', affinity_delta: 95, trust_delta: -100, note: 'Pulled her from the burning cellar', status: 'ally' } }] },
      { text: 'Mara coughs, clutching your arm.' },
    ]);
    // Mara starts at affinity 20, trust 10.
    expect(JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string)).toMatchObject({ npc: 'Mara Vell', affinity: 100, trust: -90, status: 'ally', note: /Clamped/ });
    const [rel] = await t.db
      .select()
      .from(relationships)
      .innerJoin(npcs, eq(npcs.id, relationships.npcId))
      .where(eq(npcs.name, 'Mara Vell'))
      .then((rows) => rows.filter((r) => r.npcs.campaignId === id));
    expect(rel!.relationships.historyNotes).toMatch(/\n- \(turn 1\) Pulled her from the burning cellar$/);
    expect(rel!.relationships.notesSinceCondense).toBe(1);
    const change = doneEvent(events).stateChanges[0]!;
    expect(change.humanReadable).toBe('Mara Vell: trust -100, affinity +80, now "ally"');
  });

  it('asks for a full name when a short one is ambiguous', async () => {
    const id = await newCampaign();
    await t.db.insert(npcs).values({ campaignId: id, name: 'Mara Quill' });
    const { calls } = await play(id, 'I wave to Mara.', [{ tools: [{ name: 'get_relationship', input: { npc_name: 'Mara' } }] }, { text: 'Which Mara?' }]);
    expect(toolResultsIn(calls[1]!)[0]!.content).toMatch(/Several NPCs match "Mara": .*Mara (Vell|Quill).*Use the full name/);
  });

  it('rolls skill checks server-side and awards practice xp', async () => {
    const id = await newCampaign();
    const { calls, events } = await play(id, 'I pick the warehouse lock.', [
      { tools: [{ name: 'skill_check', input: { skill_name: 'Lockpicking', difficulty: 'hard', action: 'warehouse door' } }] },
      { text: 'The lock clicks, or does not.' },
    ]);
    const result = JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string);
    expect(result.modifier).toBe(3);
    expect(result.dc).toBe(16);
    expect(result.total).toBe(result.roll + 3);
    expect(['success', 'partial', 'fail']).toContain(result.outcome);
    const types = doneEvent(events).stateChanges.map((c) => c.eventType);
    expect(types).toEqual(['skill_check', 'skill_xp']);
  });

  it('completes a mission and grants its rewards exactly once', async () => {
    const id = await newCampaign();
    const complete = { name: 'update_mission', input: { title: 'missing cargo', status: 'completed', objective_updates: [{ id: 'o4', done: true }] } };
    const { calls } = await play(id, 'I hand Mara the crate.', [{ tools: [complete] }, { tools: [complete] }, { text: 'Mara counts out your pay.' }]);
    const first = JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string);
    const second = JSON.parse(toolResultsIn(calls[2]!)[0]!.content as string);
    expect(first.rewardsGranted).toHaveLength(4); // money, xp, skill xp, relationship
    expect(second.rewardsGranted).toBeUndefined();
    const pc = await character(id);
    expect(pc.money).toBe(40 + 250);
    // 120 + 150 xp at level 2 (150 to next) → level 3 with 120 (200 to next), and +3 max HP.
    expect({ level: pc.level, xp: pc.xp, maxHp: pc.maxHp, hp: pc.hp }).toEqual({ level: 3, xp: 120, maxHp: 21, hp: 19 });
  });

  it('reports what a check was made of, and whether training decided it', async () => {
    const id = await newCampaign();
    // Level 4 brings the first level bonus.
    await t.db.update(playerCharacter).set({ level: 4 }).where(eq(playerCharacter.campaignId, id));
    const { calls } = await play(id, 'I pick the lock.', [
      { tools: [{ name: 'skill_check', input: { skill_name: 'Lockpicking', difficulty: 'medium' } }] },
      { text: '...' },
    ]);
    const result = JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string);
    expect(result.breakdown).toEqual({ skill: 3, levelBonus: 1 });
    expect(result.modifier).toBe(4);
    expect(result.skillTier).toBe('Apprentice');
    // Training mattered exactly when the roll alone (plus the level bonus) would have done worse.
    const bare = result.roll + 1 >= 12 || result.roll === 20 ? 2 : result.roll + 1 >= 9 ? 1 : 0;
    const got = { success: 2, partial: 1, fail: 0 }[result.outcome as 'success' | 'partial' | 'fail'];
    expect(Boolean(result.trainingMadeTheDifference)).toBe(got > bare);
  });

  it('skips time: trains skills, seasons the character, heals, and advances the day; undo reverts it', async () => {
    const id = await newCampaign();
    await t.db.update(playerCharacter).set({ hp: 5 }).where(eq(playerCharacter.campaignId, id));
    const skip = {
      name: 'pass_time',
      input: {
        amount: 2,
        unit: 'weeks',
        training: [
          { skill_name: 'Lockpicking', teacher: 'Old Fen' },
          { skill_name: 'Stealth', focus: 'secondary' },
        ],
        summary: 'Two weeks in Old Fen’s workshop',
      },
    };
    const { calls, events } = await play(id, '⏩ Time skip: 2 weeks. Train Lockpicking with Old Fen.', [{ tools: [skip] }, { text: 'The weeks blur.' }]);
    const result = JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string);
    // Lockpicking 3 (40 xp) + 14 × 15 × 1.5 = 315 → level 5 with 130. Stealth 2 (15) + 105 → level 3 with 45.
    expect(result.trained).toEqual([
      expect.objectContaining({ skill: 'Lockpicking', xpGained: 315, level: 5, levelBefore: 3, tier: 'Apprentice', progress: '130/150' }),
      expect.objectContaining({ skill: 'Stealth', xpGained: 105, level: 3, levelBefore: 2 }),
    ]);
    // 120 + 14 × 5 = 190 character xp at level 2 (150 to next) → level 3.
    expect(result.characterXp).toMatchObject({ gained: 70, level: 3, levelsGained: 1 });
    expect(result.hp.now).toBe(result.hp.max);
    expect(result.day).toBe(15);
    expect(doneEvent(events).stateChanges.map((c) => c.eventType)).toEqual(
      expect.arrayContaining(['time_skip', 'skill_level', 'level_up', 'hp', 'day']),
    );

    // The rolls and growth stay attached to the turn in the story history.
    const page = (await t.api('GET', `/api/campaigns/${id}/messages`)).json();
    const narration = page.items.find((m: { role: string }) => m.role === 'narrator');
    expect(narration.highlights.map((h: { eventType: string }) => h.eventType)).toEqual(['time_skip', 'skill_level', 'skill_level', 'level_up']);

    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    const pc = await character(id);
    expect({ level: pc.level, hp: pc.hp }).toEqual({ level: 2, hp: 5 });
    const [campaign] = await t.db.select().from(campaigns).where(eq(campaigns.id, id));
    expect(campaign!.gameDay).toBe(1);
    const lock = (await t.db.select().from(skills).where(eq(skills.campaignId, id))).find((s) => s.name === 'Lockpicking')!;
    expect({ level: lock.level, xp: lock.xp }).toEqual({ level: 3, xp: 40 });
  });

  it('rejects a time skip longer than the limit', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'I wait a year.', [
      { tools: [{ name: 'pass_time', input: { amount: 20, unit: 'weeks', summary: 'waiting' } }] },
      { text: '...' },
    ]);
    expect(toolResultsIn(calls[1]!)[0]).toMatchObject({ is_error: true });
    expect((await character(id)).level).toBe(2);
  });

  it('keeps private story notes and shows them to the narrator on later turns', async () => {
    const id = await newCampaign();
    await play(id, 'I look around.', [
      { tools: [{ name: 'update_story_notes', input: { notes: 'Mara is secretly skimming from the harbor guild.' } }] },
      { text: 'Gulls wheel overhead.' },
    ]);
    const { calls } = await play(id, 'I keep walking.', [{ text: 'The docks stretch on.' }]);
    const dynamic = (calls[0]!.system as Anthropic.TextBlockParam[])[1]!.text;
    expect(dynamic).toContain('# Your story notes (private; the player never sees these)\n\nMara is secretly skimming from the harbor guild.');
    expect(dynamic).toContain('Narration length: Standard');
  });

  it('requires a purpose for new locations, and lets the narrator revise one privately', async () => {
    const id = await newCampaign();
    const { calls, events } = await play(id, 'I explore.', [
      {
        tools: [
          { name: 'create_location', input: { name: 'Gull Rock', description: 'A bare rock in the Sound.' } },
          { name: 'create_location', input: { name: 'Gull Rock', description: 'A bare rock in the Sound.', purpose: 'Where the Gulls hide their loot.' } },
          { name: 'update_location', input: { name: 'The Saltworks', purpose: 'Now watched by Thane’s men.' } },
        ],
      },
      { tools: [{ name: 'get_location', input: { name: 'Gull Rock' } }] },
      { text: 'Waves.' },
    ]);
    const [missing, created, updated] = toolResultsIn(calls[1]!);
    expect(missing).toMatchObject({ is_error: true });
    expect(missing!.content).toMatch(/purpose/);
    expect(created!.is_error).toBeUndefined();
    expect(updated!.is_error).toBeUndefined();
    expect(JSON.parse(toolResultsIn(calls[2]!)[0]!.content as string)).toMatchObject({ name: 'Gull Rock', purpose: 'Where the Gulls hide their loot.' });
    const saltworks = (await t.db.select().from(locations).where(eq(locations.campaignId, id))).find((l) => l.name === 'The Saltworks')!;
    expect(saltworks.purpose).toBe('Now watched by Thane’s men.');
    // The player's change log never spells out a purpose.
    const logged = doneEvent(events).stateChanges.map((c) => c.humanReadable);
    expect(logged).toEqual(['Discovered Gull Rock', 'The narrator made private notes']);
  });

  it('forces narration after six tool rounds', async () => {
    const id = await newCampaign();
    const loop: Step = { tools: [{ name: 'get_money', input: {} }] };
    const { calls, events } = await play(id, 'I count my coins obsessively.', [loop, loop, loop, loop, loop, loop, { text: 'Forty crowns. Still forty.' }]);
    expect(calls).toHaveLength(7);
    expect(calls.slice(0, 6).every((c) => c.tool_choice === undefined)).toBe(true);
    expect(calls[6]!.tool_choice).toEqual({ type: 'none' });
    expect(events.at(-1)!.type).toBe('done');
  });

  it('rolls back the whole turn when the model call fails', async () => {
    const id = await newCampaign();
    const { events } = await play(id, 'I pocket a coin and run.', [
      { tools: [{ name: 'adjust_money', input: { delta: 5, reason: 'stolen' } }] },
      () => {
        throw new Anthropic.InternalServerError(529, { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }, 'Overloaded', new Headers());
      },
    ]);
    // A state_change was streamed before the failure, but nothing was kept.
    expect(events.some((e) => e.type === 'state_change')).toBe(true);
    expect(lastError(events)).toMatchObject({ type: 'error', retryable: true });
    expect((await character(id)).money).toBe(40);
    expect(await t.db.select().from(messages).where(eq(messages.campaignId, id))).toHaveLength(0);
    expect(await t.db.select().from(stateEvents).where(eq(stateEvents.campaignId, id))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------- selective context

describe('context builder', () => {
  async function contextFor(id: string, message: string) {
    const [campaign] = await t.db.select().from(campaigns).where(eq(campaigns.id, id));
    return buildTurnContext(t.db, campaign!, await character(id), message, 1);
  }

  it('leaves inventory, money, and relationships out of a turn that does not reference them', async () => {
    const id = await newCampaign();
    const ctx = await contextFor(id, 'I close my eyes and listen to the rain for a while.');
    const system = ctx.system.map((b) => b.text).join('\n');

    expect(ctx.manifest.prefetched).toEqual([]);
    expect(ctx.manifest.notIncluded).toEqual(expect.arrayContaining(['inventory', 'money', 'relationships', 'skill descriptions and XP']));
    for (const item of await t.db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, id))) {
      expect(system).not.toContain(item.name);
    }
    // The per-turn state block (the static block is the prompt and world bible, which name these concepts).
    const state = ctx.system[1]!.text;
    expect(state).not.toMatch(/\b40\b|money/i);
    expect(state).not.toMatch(/affinity|trust|historyNotes/i);
    // What is there: the one-line header, location, and active mission (none yet).
    expect(system).toContain('Character: Kael — Lv 2 rogue — HP 16/18 — Loc: Dockside Market');
    expect(system).toContain('Active mission: none');
    // Skill names and levels are always present so the narrator reuses them rather than inventing duplicates.
    expect(state).toMatch(/^Skills: Lockpicking 3 \(Apprentice\), .*Stealth 2 \(Novice\)/m);
  });

  it("shows the current location's purpose and names every place in the world", async () => {
    const id = await newCampaign();
    const state = (await contextFor(id, 'I look around.')).system[1]!.text;
    expect(state).toMatch(/^Purpose \(GM-only, don't reveal it directly\): The opening crossroads and rumor mill/m);
    expect(state).toContain(
      'Places in this world (6): Dockside Market; The Chapel of the Tide Mother; The Drowned Lantern; The Drowned Streets; The North Pier Warehouses; The Saltworks.',
    );
    // A full world needs no building out.
    expect(state).not.toContain('The world needs at least');
    expect(state).not.toContain('Places with no purpose yet');
  });

  it('asks the narrator to build out a world with fewer than six locations, and to give places a purpose', async () => {
    const [campaign] = await t.db.insert(campaigns).values({ name: `Sparse world ${++seq}`, worldBible: 'A lonely lighthouse coast.' }).returning();
    const [light] = await t.db.insert(locations).values({ campaignId: campaign!.id, name: 'The Lighthouse', description: 'Tall and white.' }).returning();
    await t.db.insert(playerCharacter).values({ campaignId: campaign!.id, name: 'Wren', currentLocationId: light!.id });
    const state = (await contextFor(campaign!.id, 'I climb the stairs.')).system[1]!.text;
    expect(state).toContain('The world needs at least 6 locations, and has 1. This turn, call create_location for the 5 missing ones');
    expect(state).toContain('Places with no purpose yet: The Lighthouse.');
    expect(state).toContain('Purpose (GM-only, don\'t reveal it directly): none yet; give it one with update_location');
  });

  it('pre-fetches only the NPC (and relationship) the player talks to', async () => {
    const id = await newCampaign();
    const ctx = await contextFor(id, 'I lean on the bar and ask Mara how business has been.');
    const slices = ctx.manifest.prefetched.map((p) => [p.slice, p.detail]);
    expect(slices).toEqual([
      ['npc', 'Mara Vell'],
      ['relationship', 'Mara Vell'],
    ]);
    const system = ctx.system.map((b) => b.text).join('\n');
    expect(system).toContain('"affinity":20');
    expect(system).not.toContain('Oskar Thane');
    expect(system).not.toContain('Balanced knife');
  });

  it('lists everyone the character has met, every turn', async () => {
    const id = await newCampaign();
    const state = (await contextFor(id, 'I look around.')).system[1]!.text;
    expect(state).toContain('People Kael has met (2; they know each other, so never introduce them as strangers');
    expect(state).toContain('Mara Vell (acquaintance, at The Drowned Lantern); Rook (rival, at The Saltworks).');
    expect(state).not.toContain('Oskar Thane');
  });

  it('pre-fetches people the character knows at the current location', async () => {
    const id = await newCampaign();
    await play(id, 'I head to the Lantern.', [{ tools: [{ name: 'move_player', input: { location_name: 'Drowned Lantern' } }] }, { text: 'Warm inside.' }]);
    const [campaign] = await t.db.select().from(campaigns).where(eq(campaigns.id, id));
    const ctx = await buildTurnContext(t.db, campaign!, await character(id), 'I find a seat.', 2);
    expect(ctx.manifest.prefetched.find((p) => p.slice === 'npc')).toMatchObject({ detail: 'Mara Vell', reason: expect.stringContaining('current location') });
  });

  it('remembers an NPC met in play as someone the character knows', async () => {
    const id = await newCampaign();
    await play(id, 'I chat with the net-mender.', [
      {
        tools: [
          { name: 'create_npc', input: { name: 'Old Brannoc', short_description: 'A net-mender', location_name: 'Dockside Market', first_meeting: "Mended Kael's coat for free" } },
          { name: 'create_npc', input: { name: 'The Pale Duke', short_description: 'A distant tyrant' } },
        ],
      },
      { text: 'He waves you off.' },
    ]);
    const [rel] = await t.db.select().from(relationships).innerJoin(npcs, eq(npcs.id, relationships.npcId)).where(and(eq(npcs.campaignId, id), eq(npcs.name, 'Old Brannoc')));
    expect(rel!.relationships).toMatchObject({ status: 'acquaintance', historyNotes: "- (turn 1) First met: Mended Kael's coat for free" });

    const [campaign] = await t.db.select().from(campaigns).where(eq(campaigns.id, id));
    const ctx = await buildTurnContext(t.db, campaign!, await character(id), 'I wave to Brannoc.', 2);
    const state = ctx.system[1]!.text;
    expect(state).toContain('Old Brannoc (acquaintance, at Dockside Market)');
    expect(state).toMatch(/^People Kael has met \(3;/m);
    expect(state).not.toContain('Pale Duke');
    expect(state).toContain('First met: Mended');
  });

  it('pre-fetches mentioned items and lore without loading the whole inventory', async () => {
    const id = await newCampaign();
    const ctx = await contextFor(id, 'I check my lockpicks and ask about sunstone smuggling.');
    const slices = ctx.manifest.prefetched.map((p) => `${p.slice}:${p.detail}`);
    expect(slices).toEqual(expect.arrayContaining(['item:Lockpick roll', 'lore:Sunstone Oil']));
    expect(slices.filter((s) => s.startsWith('item:'))).toHaveLength(1);
    expect(ctx.manifest.notIncluded).toContain('rest of inventory');
  });
});

// ---------------------------------------------------------------- undo

describe('undo', () => {
  async function snapshot(id: string) {
    const strip = <T extends Record<string, unknown>>(rows: T[]) =>
      rows
        .map(({ updatedAt: _u, createdAt: _c, ...rest }) => rest)
        .sort((a, b) => String(a.id ?? a.campaignId).localeCompare(String(b.id ?? b.campaignId)));
    return {
      character: strip(await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id))),
      skills: strip(await t.db.select().from(skills).where(eq(skills.campaignId, id))),
      items: strip(await t.db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, id))),
      npcs: strip(await t.db.select().from(npcs).where(eq(npcs.campaignId, id))),
      relationships: strip(await t.db.select().from(relationships).where(eq(relationships.campaignId, id))),
      locations: strip(await t.db.select().from(locations).where(eq(locations.campaignId, id))),
      missions: strip(await t.db.select().from(missions).where(eq(missions.campaignId, id))),
      turnCount: (await t.db.select().from(campaigns).where(eq(campaigns.id, id)))[0]!.turnCount,
      messages: (await t.db.select().from(messages).where(eq(messages.campaignId, id))).length,
      events: (await t.db.select().from(stateEvents).where(eq(stateEvents.campaignId, id))).length,
    };
  }

  it('reverts every kind of change the last turn made, and only the last turn', async () => {
    const id = await newCampaign();
    await play(id, 'I buy bread.', [{ tools: [{ name: 'adjust_money', input: { delta: -1, reason: 'bread' } }] }, { text: 'Crusty.' }]);
    const before = await snapshot(id);

    const { events } = await play(id, 'A very eventful turn.', [
      {
        tools: [
          { name: 'adjust_money', input: { delta: 100, reason: 'found purse' } },
          { name: 'add_item', input: { name: 'Hard bread', quantity: 2 } }, // stacks onto an existing item
          { name: 'add_item', input: { name: 'Silver locket', tags: ['jewelry'] } }, // new row
          { name: 'remove_item', input: { name: 'Waterskin', reason: 'lost' } }, // deletes a row
          { name: 'equip_item', input: { name: 'Brass compass', equipped: true } },
          { name: 'grant_skill_xp', input: { skill_name: 'Lockpicking', amount: 400, reason: 'montage' } }, // multi level-up
          { name: 'grant_skill_xp', input: { skill_name: 'Swimming', amount: 10, reason: 'fell in' } }, // new skill
          { name: 'adjust_hp', input: { delta: -6, reason: 'fall' } },
          { name: 'update_status_effect', input: { action: 'add', name: 'Soaked' } },
          { name: 'adjust_relationship', input: { npc_name: 'Sister Ilse', trust_delta: 10, note: 'Helped at the stall' } }, // new relationship
          { name: 'create_location', input: { name: 'Gallows Pier', description: 'A pier with a grim history.', purpose: 'Where the watch hangs smugglers.', parent_location_name: 'Dockside Market' } },
          { name: 'create_npc', input: { name: 'Old Brannoc', short_description: 'A net-mender', location_name: 'Gallows Pier' } },
          { name: 'update_npc', input: { name: 'Rook', alive: false } },
          { name: 'move_player', input: { location_name: 'Gallows Pier' } },
          { name: 'update_mission', input: { title: "The Lantern's Missing Cargo", status: 'completed' } }, // + rewards
          { name: 'create_mission', input: { title: 'The Drowned Bell', description: 'Find the bell.', giver_npc_name: 'Old Brannoc', objectives: ['Dive for it'] } },
          { name: 'skill_check', input: { skill_name: 'Stealth', difficulty: 'easy' } },
        ],
      },
      { text: 'What a day.' },
    ]);
    expect(events.at(-1)!.type).toBe('done');
    const during = await snapshot(id);
    expect(during).not.toEqual(before);
    expect(during.turnCount).toBe(2);

    const undo = await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    expect(undo.statusCode).toBe(200);
    expect(undo.json().undoneTurn).toBe(2);
    expect(undo.json().revertedChanges.length).toBeGreaterThan(15);

    expect(await snapshot(id)).toEqual(before);

    // Undo again reverts turn 1, then there is nothing left.
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    expect((await character(id)).money).toBe(40);
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(400);
  });

  it('replays the same dice after an undo (no re-rolling)', async () => {
    const id = await newCampaign();
    const check: Step[] = [{ tools: [{ name: 'skill_check', input: { skill_name: 'Stealth', difficulty: 'hard' } }] }, { text: '...' }];
    const first = JSON.parse(toolResultsIn((await play(id, 'I sneak.', check)).calls[1]!)[0]!.content as string);
    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    const again = JSON.parse(toolResultsIn((await play(id, 'I sneak.', check)).calls[1]!)[0]!.content as string);
    expect(again.roll).toBe(first.roll);
  });
});

// ---------------------------------------------------------------- map

describe('map snapshot', () => {
  it('lists every location with visits, journeys, and the NPCs the character knows there', async () => {
    const id = await newCampaign();
    await play(id, 'I go to the tavern, then explore its cellar.', [
      {
        tools: [
          { name: 'move_player', input: { location_name: 'Drowned Lantern' } },
          { name: 'create_location', input: { name: 'Lantern Cellar', description: 'Barrels and damp.', purpose: 'Mara keeps her sunstone here.', parent_location_name: 'Drowned Lantern' } },
          { name: 'move_player', input: { location_name: 'Lantern Cellar' } },
          { name: 'move_player', input: { location_name: 'Drowned Lantern' } },
          { name: 'move_player', input: { location_name: 'Dockside Market' } },
        ],
      },
      { text: 'Round and round.' },
    ]);
    const { map } = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as import('@narrator/shared').CampaignState;
    const byName = Object.fromEntries(map.locations.map((l) => [l.name, l]));
    expect(Object.keys(byName)).toEqual([
      'Dockside Market',
      'The Chapel of the Tide Mother',
      'The Drowned Lantern',
      'The Drowned Streets',
      'The North Pier Warehouses',
      'The Saltworks',
      'Lantern Cellar',
    ]);
    expect(byName['Lantern Cellar']).toMatchObject({ parentLocationId: byName['The Drowned Lantern']!.id, visited: true });
    expect(byName['The Saltworks']!.visited).toBe(false);
    // Kael knows Mara (at the Lantern) and Rook (Saltworks); the market's harbormaster and priest are strangers.
    expect(byName['The Drowned Lantern']!.knownNpcs).toEqual(['Mara Vell']);
    expect(byName['The Saltworks']!.knownNpcs).toEqual(['Rook']);
    expect(byName['Dockside Market']!.knownNpcs).toEqual([]);
    const trip = (a: string, b: string) =>
      map.travels.find((t) => [t.fromId, t.toId].sort().join() === [byName[a]!.id, byName[b]!.id].sort().join())?.count;
    expect(trip('Dockside Market', 'The Drowned Lantern')).toBe(2);
    expect(trip('The Drowned Lantern', 'Lantern Cellar')).toBe(2);
    expect(map.travels).toHaveLength(2);
  });
});

// ---------------------------------------------------------------- conditions

describe('conditions', () => {
  const result = (calls: Anthropic.MessageStreamParams[], i = 0) => JSON.parse(toolResultsIn(calls[1]!)[i]!.content as string);

  it('adds a condition\'s modifiers to matching checks, and says when they decided the outcome', async () => {
    const id = await newCampaign();
    const check: Step[] = [{ tools: [{ name: 'skill_check', input: { skill_name: 'Persuasion', difficulty: 'medium' } }] }, { text: '...' }];
    const before = result((await play(id, 'I talk my way in.', check)).calls);
    await play(id, 'Cursed.', [
      {
        tools: [
          { name: 'update_status_effect', input: { action: 'add', name: 'Curse: Honest Face', description: 'Every feeling shows.', modifiers: [{ target: 'persuasion', bonus: -3 }, { target: 'Stealth', bonus: -1 }] } },
        ],
      },
      { text: 'Ouch.' },
    ]);
    const after = result((await play(id, 'I talk my way in again.', check)).calls);
    expect(after.modifier).toBe(before.modifier - 3);
    expect(after.breakdown.conditions).toEqual([{ condition: 'Curse: Honest Face', bonus: -3 }]);
    if (after.conditionsMadeTheDifference) expect(after.conditionsMadeTheDifference).toBe('Hurt by Curse: Honest Face');

    const state = (await contextFor(id)).system[1]!.text;
    expect(state).toContain('Conditions (their modifiers are added to skill_check automatically');
    expect(state).toContain('Curse: Honest Face (persuasion -3, Stealth -1)');
  });

  it('updates a condition in place and counts timed ones down each turn', async () => {
    const id = await newCampaign();
    await play(id, 'I get hurt and lucky.', [
      {
        tools: [
          { name: 'update_status_effect', input: { action: 'add', name: 'Bruised', turns: 2 } },
          { name: 'update_status_effect', input: { action: 'add', name: 'Inspired', modifiers: [] } },
        ],
      },
      { text: 'Ow.' },
    ]);
    // Set this turn, so not counted down yet.
    expect((await character(id)).statusEffects.find((e) => e.name === 'Bruised')).toMatchObject({ turnsRemaining: 2, modifiers: [] });

    await play(id, 'I wince.', [{ tools: [{ name: 'update_status_effect', input: { action: 'update', name: 'Bruised', modifiers: [{ target: 'all', bonus: -1 }] } }] }, { text: 'Hm.' }]);
    // The update left the count alone, so it ticked.
    expect((await character(id)).statusEffects.find((e) => e.name === 'Bruised')).toMatchObject({ turnsRemaining: 1, modifiers: [{ target: 'all', bonus: -1 }] });

    const { events } = await play(id, 'I rest.', [{ text: 'Better.' }]);
    expect((await character(id)).statusEffects.map((e) => e.name)).toEqual(['Inspired']);
    expect(events.some((e) => e.type === 'state_change' && e.change.humanReadable === 'Wore off: Bruised')).toBe(true);

    // Undo brings it back.
    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    expect((await character(id)).statusEffects.find((e) => e.name === 'Bruised')?.turnsRemaining).toBe(1);
  });

  it('asks the narrator to review conditions from before modifiers, and migrates the seeded ones', async () => {
    const id = await newCampaign();
    await t.db
      .update(playerCharacter)
      .set({ statusEffects: [{ name: 'Cracked Ribs', description: '', turnsRemaining: 5 }, { name: 'Drunk', description: '', turnsRemaining: null }] })
      .where(eq(playerCharacter.campaignId, id));
    expect((await contextFor(id)).system[1]!.text).toContain('Conditions from before modifiers existed: Cracked Ribs; Drunk.');

    const migration = readFileSync(join(migrationsDir, '0007_condition_modifiers.sql'), 'utf8');
    for (const statement of migration.split('--> statement-breakpoint')) await t.db.execute(sql.raw(statement));
    expect((await character(id)).statusEffects).toEqual([
      { name: 'Cracked Ribs', description: '', turnsRemaining: 5, modifiers: [{ target: 'strength', bonus: -2 }, { target: 'agility', bonus: -1 }] },
      { name: 'Drunk', description: '', turnsRemaining: null },
    ]);
    expect((await contextFor(id)).system[1]!.text).toContain('Conditions from before modifiers existed: Drunk.');
  });

  async function contextFor(id: string) {
    const [campaign] = await t.db.select().from(campaigns).where(eq(campaigns.id, id));
    return buildTurnContext(t.db, campaign!, await character(id), 'I look around.', 99);
  }
});
