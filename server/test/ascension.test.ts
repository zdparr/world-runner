import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { and, eq } from 'drizzle-orm';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { campaigns, missions, playerCharacter } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';

// The ascension rule set (attributes, stat points, daily quests), played in Threshold.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (world = 'threshold') => createFromTemplate(t.db, world, { name: `Ascension test ${++seq}`, includeCharacter: true });

async function play(campaignId: string, content: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return { events, calls: model.calls };
}

const character = async (id: string) => (await t.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, id)))[0]!;
const result = (call: Anthropic.MessageStreamParams, i = 0) => toolResultsIn(call)[i]!;
const daily = async (id: string) =>
  (await t.db.select().from(missions).where(and(eq(missions.campaignId, id), eq(missions.recurrence, 'daily'))))[0]!;

describe('ascension rule set', () => {
  it('offers its tools only to ascension campaigns', async () => {
    const toolsFor = async (id: string) => {
      const { calls } = await play(id, 'I look around.', [{ text: 'Quiet.' }]);
      return calls[0]!.tools as Anthropic.Tool[];
    };
    const classic = await toolsFor(await newCampaign('brinecross'));
    const ascension = await toolsFor(await newCampaign());
    const names = (tools: Anthropic.Tool[]) => tools.map((x) => x.name);

    expect(names(classic)).not.toContain('allocate_stat_point');
    expect(names(classic)).not.toContain('advance_day');
    expect(names(ascension)).toEqual(expect.arrayContaining(['allocate_stat_point', 'advance_day']));
    const schema = (tools: Anthropic.Tool[], name: string) => JSON.stringify(tools.find((x) => x.name === name)!.input_schema);
    expect(schema(classic, 'skill_check')).not.toContain('attribute');
    expect(schema(ascension, 'skill_check')).toContain('attribute');
    expect(schema(classic, 'create_mission')).not.toContain('recurrence');
    expect(schema(ascension, 'create_mission')).toContain('recurrence');

    // A classic campaign can't call an ascension tool even if it tries.
    const id = await newCampaign('brinecross');
    const { calls } = await play(id, 'I sleep.', [{ tools: [{ name: 'advance_day', input: { reason: 'night' } }] }, { text: 'Morning.' }]);
    expect(result(calls[1]!)).toMatchObject({ is_error: true, content: 'Unknown tool "advance_day".' });
  });

  it('puts attributes, the day, and daily quests in the turn context', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'I stretch.', [{ text: 'Your ribs complain.' }]);
    const [staticBlock, dynamicBlock] = (calls[0]!.system as Anthropic.TextBlockParam[]).map((b) => b.text);
    expect(staticBlock).toContain('# Rule set: Ascension');
    expect(dynamicBlock).toContain('Attributes: Strength 5, Agility 6, Vitality 5, Perception 7, Will 8 (unspent stat points: 0)');
    expect(dynamicBlock).toContain('In-game day: 1');
    expect(dynamicBlock).toContain(
      'Daily quests: Daily Quest: Baseline (active; to do: o1 "Carry 500 pounds of debris or equipment over the course of the day", o2 "Cover 5 miles on foot before nightfall")',
    );
    // The daily quest doesn't crowd out the story mission.
    expect(dynamicBlock).not.toContain('Active mission: Daily Quest');

    const classic = await play(await newCampaign('brinecross'), 'I stretch.', [{ text: 'Gulls.' }]);
    const [classicStatic, classicDynamic] = (classic.calls[0]!.system as Anthropic.TextBlockParam[]).map((b) => b.text);
    expect(classicStatic).not.toContain('Rule set: Ascension');
    expect(classicDynamic).not.toContain('Attributes:');
  });

  it('grants stat points on level-up and spends them only as far as they go', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'I clear the Breach.', [
      { tools: [{ name: 'grant_xp', input: { amount: 100, reason: 'first clear' } }] },
      { tools: [{ name: 'allocate_stat_point', input: { attribute: 'agility', points: 2, reason: 'player choice' } }] },
      { tools: [{ name: 'allocate_stat_point', input: { attribute: 'will', points: 5 } }] },
      { text: 'You feel lighter.' },
    ]);
    expect(JSON.parse(result(calls[1]!).content as string)).toMatchObject({ level: 2, statPointsGained: 3, unspentStatPoints: 3 });
    expect(JSON.parse(result(calls[2]!).content as string)).toEqual({ attribute: 'agility', before: 6, after: 8, unspentStatPoints: 1 });
    expect(result(calls[3]!)).toMatchObject({ is_error: true });
    const pc = await character(id);
    expect(pc.attributes).toMatchObject({ agility: 8, will: 8 });
    expect(pc.unspentStatPoints).toBe(1);
  });

  it('adds the named attribute to skill checks', async () => {
    const id = await newCampaign();
    const { calls } = await play(id, 'I look for the seam.', [
      { tools: [{ name: 'skill_check', input: { skill_name: 'Salvage', difficulty: 'medium', attribute: 'perception' } }] },
      { text: '...' },
    ]);
    const check = JSON.parse(result(calls[1]!).content as string);
    // Perception 7 adds +1; Salvage is a starting skill.
    expect(check).toMatchObject({ attribute: 'perception', attributeBonus: 1 });
    const salvage = (await t.api('GET', `/api/campaigns/${id}/skills`)).json().find((s: { name: string }) => s.name === 'Salvage');
    expect(check.modifier).toBe(salvage.level + 1);
  });

  it('fails an unfinished daily at day end, applies its penalty, and resets it; undo reverts all of it', async () => {
    const id = await newCampaign();
    const before = await character(id);
    const { calls } = await play(id, 'I sleep through the night.', [
      { tools: [{ name: 'advance_day', input: { reason: 'slept', daily_objectives: [{ title: 'Daily Quest: Baseline', objectives: ['Run 3 miles before sunrise'] }] } }] },
      { text: 'Dawn.' },
    ]);
    const out = JSON.parse(result(calls[1]!).content as string);
    expect(out).toMatchObject({ day: 2, dailies: [{ title: 'Daily Quest: Baseline', missed: true, status: 'active' }] });

    const after = await character(id);
    expect(after.hp).toBe(before.hp - 3);
    expect(after.statusEffects.map((s) => s.name)).toContain('Protocol Deficit');
    const m = await daily(id);
    expect(m.objectives).toEqual([{ id: 'o1', text: 'Run 3 miles before sunrise', done: false }]);
    expect((await t.db.select().from(campaigns).where(eq(campaigns.id, id)))[0]!.gameDay).toBe(2);

    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    const undone = await character(id);
    expect(undone.hp).toBe(before.hp);
    expect(undone.statusEffects).toEqual(before.statusEffects);
    expect((await daily(id)).objectives.map((o) => o.text)[0]).toMatch(/^Carry 500 pounds/);
    expect((await t.db.select().from(campaigns).where(eq(campaigns.id, id)))[0]!.gameDay).toBe(1);
  });

  it('resets a completed daily without penalty, so its rewards can be earned again', async () => {
    const id = await newCampaign();
    const complete = { name: 'update_mission', input: { title: 'Daily Quest: Baseline', status: 'completed' } };
    await play(id, 'I finish the daily.', [{ tools: [complete] }, { text: 'Done.' }]);
    const xpAfterFirst = (await character(id)).xp;
    expect(xpAfterFirst).toBe(40);

    const hp = (await character(id)).hp;
    const { calls } = await play(id, 'I sleep.', [{ tools: [{ name: 'advance_day', input: { reason: 'slept' } }] }, { text: 'Dawn.' }]);
    expect(JSON.parse(result(calls[1]!).content as string).dailies[0]).toMatchObject({ missed: false, penalties: [] });
    expect((await character(id)).hp).toBe(hp);
    expect(await daily(id)).toMatchObject({ status: 'active', rewardsGranted: false });

    await play(id, 'I finish it again.', [{ tools: [complete] }, { text: 'Done.' }]);
    expect((await character(id)).xp).toBe(80);
  });

  it('completes a daily quest, with its rewards, when its last objective is ticked', async () => {
    const id = await newCampaign();
    const tick = (oid: string) => ({ name: 'update_mission', input: { title: 'Daily Quest: Baseline', objective_updates: [{ id: oid, done: true }] } });
    await play(id, 'I haul debris all morning.', [{ tools: [tick('o1')] }, { text: 'Heavy.' }]);
    expect(await daily(id)).toMatchObject({ status: 'active', rewardsGranted: false });

    const { calls } = await play(id, 'I walk the last miles.', [{ tools: [tick('o2')] }, { text: 'Done.' }]);
    expect(JSON.parse(result(calls[1]!).content as string)).toMatchObject({ status: 'completed', rewardsGranted: [{ xp: 40 }] });
    expect(await daily(id)).toMatchObject({ status: 'completed', rewardsGranted: true });
    expect((await character(id)).xp).toBe(40);

    // Day end: completed, so no penalty.
    const hp = (await character(id)).hp;
    await play(id, 'I sleep.', [{ tools: [{ name: 'advance_day', input: { reason: 'slept' } }] }, { text: 'Dawn.' }]);
    expect((await character(id)).hp).toBe(hp);
  });

  it('lets the narrator issue new daily quests', async () => {
    const id = await newCampaign();
    await play(id, 'The System speaks.', [
      {
        tools: [
          {
            name: 'create_mission',
            input: {
              title: 'Daily Quest: Silence',
              description: 'Speak to no one before noon.',
              objectives: ['Say nothing until noon'],
              status: 'active',
              recurrence: 'daily',
              penalty: { hpLoss: 2 },
            },
          },
        ],
      },
      { text: 'Blue letters.' },
    ]);
    const [m] = await t.db.select().from(missions).where(and(eq(missions.campaignId, id), eq(missions.title, 'Daily Quest: Silence')));
    expect(m).toMatchObject({ recurrence: 'daily', penalty: { hpLoss: 2 }, status: 'active' });
  });
});
