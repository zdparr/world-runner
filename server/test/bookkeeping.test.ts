import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { and, eq } from 'drizzle-orm';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { campaigns, missions, npcs, playerCharacter, stateEvents } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';

// Keeping the database in step with the story: the end-of-day review, one day per night, nightly
// routines, logged hand corrections, and NPC records fetched for the scene.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = () => createFromTemplate(t.db, 'threshold', { name: `Bookkeeping test ${++seq}`, includeCharacter: true });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const result = (call: Anthropic.MessageStreamParams, i = 0) => toolResultsIn(call)[i]!;
const output = (call: Anthropic.MessageStreamParams) => JSON.parse(result(call).content as string);
const dynamicBlock = (call: Anthropic.MessageStreamParams) => (call.system as Anthropic.TextBlockParam[])[1]!.text;
const character = async (id: string) => (await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id)))[0]!;
const daily = async (id: string) =>
  (await t.db.select().from(missions).where(and(eq(missions.campaignId, id), eq(missions.recurrence, 'daily'))))[0]!;
const manualEdits = (id: string) =>
  t.db.select().from(stateEvents).where(and(eq(stateEvents.campaignId, id), eq(stateEvents.eventType, 'manual_edit')));

const QUEST = 'Daily Quest: Baseline';
const sleep = (extra: Record<string, unknown> = {}) => ({
  name: 'advance_day',
  input: { reason: 'slept', daily_review: [{ title: QUEST, met: [] }], ...extra },
});

describe('end of the day', () => {
  it('will not end the day until open daily objectives are reviewed, then ticks and pays the ones met', async () => {
    const id = await newCampaign();
    const hp = (await character(id)).hp;
    const { calls } = await play(id, 'I sleep.', [
      { tools: [{ name: 'advance_day', input: { reason: 'slept' } }] },
      { tools: [{ name: 'advance_day', input: { reason: 'slept', daily_review: [{ title: QUEST, met: ['o1', 'o2'] }] } }] },
      { text: 'Dawn.' },
    ]);

    expect(result(calls[1]!)).toMatchObject({ is_error: true });
    expect(result(calls[1]!).content).toContain('o1 "Carry 500 pounds');
    expect(result(calls[1]!).content).toContain('o2 "Cover 5 miles');

    const out = output(calls[2]!);
    expect(out.reviewed).toEqual([expect.objectContaining({ title: QUEST, status: 'completed', rewardsGranted: [expect.objectContaining({ xp: 40 })] })]);
    expect(out.dailies).toEqual([expect.objectContaining({ title: QUEST, missed: false, penalties: [] })]);
    expect((await character(id)).hp).toBe(hp);
    expect((await character(id)).xp).toBe(40);
    expect(await daily(id)).toMatchObject({ status: 'active', rewardsGranted: false });
  });

  it('refuses a second new day right after the first, unless a further night is confirmed', async () => {
    const id = await newCampaign();
    await play(id, 'I sleep.', [{ tools: [sleep()] }, { text: 'Dawn.' }]);
    const { calls } = await play(id, 'I sleep again.', [{ tools: [sleep()] }, { tools: [sleep({ new_night: true })] }, { text: 'Another dawn.' }]);

    expect(result(calls[1]!)).toMatchObject({ is_error: true });
    expect(result(calls[1]!).content).toContain('Day 2 already began last turn');
    expect(output(calls[2]!)).toMatchObject({ day: 3 });
    expect((await t.db.select().from(campaigns).where(eq(campaigns.id, id)))[0]!.gameDay).toBe(3);
  });
});

describe('routines', () => {
  it('trains nightly routines on their own every night and through time skips', async () => {
    const id = await newCampaign();
    const { calls: setup } = await play(id, 'From now on I train in my sleep.', [
      { tools: [{ name: 'set_routine', input: { name: 'Sleep training', skills: ['salvage', 'Driving'], hours: 6, teacher: 'the voice' } }] },
      { text: 'The voice agrees.' },
    ]);
    expect(output(setup[1]!).routines).toEqual(['Sleep training: Salvage, Driving (6h a night, taught by the voice)']);

    // 6 hours shared by two skills is half a training day each: 15 xp a day x 0.5 x 1.5 (teacher) = 11.
    const { calls } = await play(id, 'I sleep.', [{ tools: [sleep()] }, { text: 'Dawn.' }]);
    expect(output(calls[1]!).routines).toEqual([
      {
        routine: 'Sleep training',
        trained: [expect.objectContaining({ skill: 'Salvage', xpGained: 11 }), expect.objectContaining({ skill: 'Driving', xpGained: 11 })],
      },
    ]);
    expect(dynamicBlock(calls[0]!)).toContain('Nightly routines (trained automatically every night and during time skips; never grant their XP by hand): Sleep training');

    // An interrupted night skips it.
    const { calls: skipped } = await play(id, 'I barely sleep.', [{ tools: [sleep({ new_night: true, skip_routines: ['sleep training'] })] }, { text: 'Groggy.' }]);
    expect(output(skipped[1]!).routines).toBeUndefined();

    // Three days of skipped time are three nights of it.
    const { calls: skip } = await play(id, 'I lie low for three days.', [
      { tools: [{ name: 'pass_time', input: { amount: 3, unit: 'days', summary: 'lying low' } }] },
      { text: 'Quiet days.' },
    ]);
    expect(output(skip[1]!).routines).toEqual([expect.objectContaining({ routine: 'Sleep training', nights: 3 })]);
    expect(output(skip[1]!).routines[0].trained[0]).toMatchObject({ skill: 'Salvage', xpGained: 34 });
  });
});

describe('hand corrections', () => {
  it('logs edits made during play, shows them to the narrator, and undo reverts them', async () => {
    const id = await newCampaign();
    const [florian] = await t.db.select().from(npcs).where(and(eq(npcs.campaignId, id), eq(npcs.name, 'Florian Kuzma')));
    const originalNotes = florian!.notes;

    // Setting up before the first turn isn't a correction.
    expect((await t.api('PATCH', `/api/campaigns/${id}/npcs/${florian!.id}`, { faction: 'Kuzma Aquatics' })).statusCode).toBe(200);
    expect(await manualEdits(id)).toHaveLength(0);

    await play(id, 'I look around.', [{ text: 'Quiet.' }]);
    await t.api('PATCH', `/api/campaigns/${id}/npcs/${florian!.id}`, { notes: 'Now owes the character a favour.' });
    const quest = await daily(id);
    await t.api('PATCH', `/api/campaigns/${id}/missions/${quest.id}`, {
      objectives: quest.objectives.map((o) => (o.id === 'o1' ? { ...o, done: true } : o)),
    });

    const edits = await manualEdits(id);
    expect(edits.map((e) => [e.turnNumber, e.humanReadable])).toEqual([
      [1, 'Player correction: NPC "Florian Kuzma": notes'],
      [1, expect.stringMatching(/^Player correction: mission "Daily Quest: Baseline": o1 "Carry 500 pounds.*" ✓$/)],
    ]);

    const { calls } = await play(id, 'I check in.', [{ text: 'Noted.' }]);
    const context = dynamicBlock(calls[0]!);
    expect(context).toContain('# Player corrections since your last turn');
    expect(context).toContain('- Player correction: NPC "Florian Kuzma": notes');

    // Undoing the turn the corrections were logged on reverts them with it.
    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    const [restored] = await t.db.select().from(npcs).where(eq(npcs.id, florian!.id));
    expect(restored!.notes).toBe(originalNotes);
    expect((await daily(id)).objectives.every((o) => !o.done)).toBe(true);
  });

  it('logs a character sheet save only for what changed', async () => {
    const id = await newCampaign();
    await play(id, 'I look around.', [{ text: 'Quiet.' }]);
    const sheet = (await t.api('GET', `/api/campaigns/${id}/character/sheet`)).json();
    const save = (skills: unknown[]) =>
      t.api('PUT', `/api/campaigns/${id}/character/sheet`, {
        character: {
          name: sheet.character.name,
          archetype: sheet.character.archetype,
          bio: sheet.character.bio,
          currentLocationId: sheet.character.currentLocationId,
          money: sheet.character.money,
          level: sheet.character.level,
          xp: sheet.character.xp,
          hp: sheet.character.hp,
          maxHp: sheet.character.maxHp,
          statusEffects: sheet.character.statusEffects,
          attributes: sheet.character.attributes,
          unspentStatPoints: sheet.character.unspentStatPoints,
          routines: sheet.character.routines,
        },
        skills,
        items: sheet.items.map(({ id: itemId, name, description, quantity, tags, equipped, properties }: Record<string, unknown>) => ({
          id: itemId,
          name,
          description,
          quantity,
          tags,
          equipped,
          properties,
        })),
      });
    const skills = sheet.skills.map(({ id: skillId, name, level, xp, description }: Record<string, unknown>) => ({ id: skillId, name, level, xp, description }));

    expect((await save(skills)).statusCode).toBe(200);
    expect(await manualEdits(id)).toHaveLength(0);

    expect((await save(skills.map((s: { name: string; xp: number }) => (s.name === 'Salvage' ? { ...s, xp: 60 } : s)))).statusCode).toBe(200);
    expect((await manualEdits(id)).map((e) => e.humanReadable)).toEqual(['Player correction: skill "Salvage": xp 40 → 60']);
  });
});

describe('NPCs in the scene', () => {
  it('fetches NPCs the last narration named, and flags records that have gone stale', async () => {
    const id = await newCampaign();
    await play(id, 'I head to the shop.', [{ text: 'Florian Kuzma looks up from the tanks as you come in.' }]);
    // Pretend a long campaign has passed since his record was written.
    await t.db.update(campaigns).set({ turnCount: 80 }).where(eq(campaigns.id, id));

    const { calls } = await play(id, 'I ask what he wants.', [{ text: '...' }]);
    const context = dynamicBlock(calls[0]!);
    expect(context).toContain('## NPC: Florian Kuzma');
    expect(context).toContain('"recordLastUpdated":"never, since the campaign began"');
    expect(context).toContain('"stale":"Not updated in 81 turns.');
  });
});
