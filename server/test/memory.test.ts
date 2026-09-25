import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { and, asc, eq } from 'drizzle-orm';
import { createTestApp } from './helpers';
import { doneEvent, parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { campaigns, messages, npcs, relationships, stateEvents } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { parseBullets, type UtilityFn } from '../src/engine/memory';

// A scripted utility model: records every request, answers with whatever `reply` returns.
type UtilityRequest = Parameters<UtilityFn>[0];
const requests: UtilityRequest[] = [];
let reply: (req: UtilityRequest) => string | Promise<string> = () => 'A summary.';
const utility: UtilityFn = async (req) => {
  requests.push(req);
  return { text: await reply(req), inputTokens: 500, outputTokens: 120 };
};

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp({ utility });
}, 30_000);
afterAll(async () => {
  await t?.close();
});
beforeEach(() => {
  requests.length = 0;
  reply = (req) => (req.system.includes('bullets') ? '- One\n- Two\n- Three' : 'A summary.');
});

let seq = 0;
/** A Brinecross campaign with a small window, so folds come due quickly. */
async function newCampaign(settings: { historyWindow?: number; summaryInterval?: number } = {}) {
  const id = await createFromTemplate(t.db, 'brinecross', { name: `Memory test ${++seq}`, includeCharacter: true });
  await t.db
    .update(campaigns)
    .set({ historyWindow: settings.historyWindow ?? 4, summaryInterval: settings.summaryInterval ?? 3 })
    .where(eq(campaigns.id, id));
  return id;
}

/** Play one turn, then wait for the post-turn maintenance it triggers. */
async function play(id: string, content: string, steps: Step[] = [{ text: `The narrator answers: ${content}` }]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${id}/turns`, { content });
  const events = parseSse(res.body);
  doneEvent(events);
  await t.app.maintenance.idle();
  return { events, calls: model.calls };
}

const campaign = async (id: string) => (await t.db.select().from(campaigns).where(eq(campaigns.id, id)))[0]!;
const summarizedTurns = async (id: string) =>
  [
    ...new Set(
      (await t.db.select().from(messages).where(and(eq(messages.campaignId, id), eq(messages.summarized, true))).orderBy(asc(messages.id))).map(
        (m) => m.turnNumber,
      ),
    ),
  ];
const memoryEvents = (id: string) =>
  t.db.select().from(stateEvents).where(eq(stateEvents.campaignId, id)).then((rows) => rows.filter((e) => e.eventType.startsWith('memory_')));
const summaryRequests = () => requests.filter((r) => r.system.includes('running memory'));

// ---------------------------------------------------------------- rolling summary

describe('rolling summary', () => {
  it('folds turns that left the recent window every K turns, off the request path', async () => {
    const id = await newCampaign(); // window 4 messages (2 turns), interval 3
    for (let turn = 1; turn <= 4; turn++) await play(id, `Turn ${turn} action`);
    // Turns 1-2 are outside the window, but that's fewer than 3: not due yet.
    expect(summaryRequests()).toHaveLength(0);
    expect((await campaign(id)).rollingSummary).toBe('');

    reply = () => 'Kael arrived in Brinecross and did three things.';
    await play(id, 'Turn 5 action');
    expect(summaryRequests()).toHaveLength(1);
    const prompt = summaryRequests()[0]!.prompt;
    expect(prompt).toContain('[Turn 1] Player (as Kael): \nTurn 1 action'.replace(': \n', ':\n'));
    expect(prompt).toContain('[Turn 3] Narrator:');
    expect(prompt).not.toContain('[Turn 4]');

    expect((await campaign(id)).rollingSummary).toBe('Kael arrived in Brinecross and did three things.');
    expect(await summarizedTurns(id)).toEqual([1, 2, 3]);
    const [event] = await memoryEvents(id);
    expect(event).toMatchObject({ turnNumber: 5, eventType: 'memory_summary', humanReadable: 'Story so far updated: turns 1–3 folded into the summary' });

    // The next turn sees the summary and only the unsummarized turns (4 and 5) verbatim.
    const { calls } = await play(id, 'Turn 6 action');
    const system = calls[0]!.system as { text: string }[];
    expect(system[1]!.text).toContain('# Story so far\n\nKael arrived in Brinecross and did three things.');
    const sent = calls[0]!.messages.map((m) => (typeof m.content === 'string' ? m.content : m.content.map((b) => ('text' in b ? b.text : '')).join('')));
    expect(sent).toEqual([
      'Turn 4 action',
      'The narrator answers: Turn 4 action',
      'Turn 5 action',
      'The narrator answers: Turn 5 action',
      'Turn 6 action',
    ]);
  });

  it('keeps sending unsummarized history between folds', async () => {
    const id = await newCampaign({ historyWindow: 2, summaryInterval: 10 });
    for (let turn = 1; turn <= 3; turn++) await play(id, `Turn ${turn} action`);
    const { calls } = await play(id, 'Turn 4 action');
    // Window is 2 messages, but nothing is folded yet: all 3 earlier turns are still sent.
    expect(calls[0]!.messages).toHaveLength(7);
  });

  it('folds early when the unsummarized history outgrows its token budget', async () => {
    const id = await newCampaign({ historyWindow: 2, summaryInterval: 50 });
    const long = 'The tide rolls in. '.repeat(700); // ~13k chars (~3.3k tokens) per narration
    await play(id, 'Turn 1', [{ text: long }]);
    expect(summaryRequests()).toHaveLength(0);
    await play(id, 'Turn 2', [{ text: long }]);
    expect(summaryRequests()).toHaveLength(1);
    expect(await summarizedTurns(id)).toEqual([1]);
    expect((await memoryEvents(id))[0]!.payload).toMatchObject({ details: { reason: expect.stringMatching(/budget/) } });
  });

  it('is undone with the turn it was recorded on', async () => {
    const id = await newCampaign();
    for (let turn = 1; turn <= 5; turn++) await play(id, `Turn ${turn} action`);
    expect(await summarizedTurns(id)).toEqual([1, 2, 3]);

    const undo = await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    expect(undo.statusCode).toBe(200);
    expect(undo.json().revertedChanges.map((c: { eventType: string }) => c.eventType)).toContain('memory_summary');
    expect((await campaign(id)).rollingSummary).toBe('');
    expect(await summarizedTurns(id)).toEqual([]);
    expect(await memoryEvents(id)).toHaveLength(0);
  });

  it('drops a summary whose inputs changed while the model was writing it', async () => {
    const id = await newCampaign();
    for (let turn = 1; turn <= 4; turn++) await play(id, `Turn ${turn} action`);
    reply = async () => {
      // Someone edits the summary mid-flight.
      await t.db.update(campaigns).set({ rollingSummary: 'Hand-written summary.' }).where(eq(campaigns.id, id));
      return 'Stale summary.';
    };
    await play(id, 'Turn 5 action');
    expect(summaryRequests()).toHaveLength(1);
    expect((await campaign(id)).rollingSummary).toBe('Hand-written summary.');
    expect(await summarizedTurns(id)).toEqual([]);

    // Retried after the next turn, building on the new summary.
    reply = () => 'Fresh summary.';
    await play(id, 'Turn 6 action');
    expect(summaryRequests()[1]!.prompt).toContain('Hand-written summary.');
    expect((await campaign(id)).rollingSummary).toBe('Fresh summary.');
    expect(await summarizedTurns(id)).toEqual([1, 2, 3, 4]);
  });

  it('survives a failing utility model and retries later', async () => {
    const id = await newCampaign();
    for (let turn = 1; turn <= 4; turn++) await play(id, `Turn ${turn} action`);
    reply = () => {
      throw new Error('overloaded');
    };
    await play(id, 'Turn 5 action'); // the turn itself still succeeds
    expect((await campaign(id)).rollingSummary).toBe('');
    reply = () => 'Recovered.';
    await play(id, 'Turn 6 action');
    expect((await campaign(id)).rollingSummary).toBe('Recovered.');
  });

  it('can be run on demand', async () => {
    const id = await newCampaign({ historyWindow: 2, summaryInterval: 10 });
    for (let turn = 1; turn <= 2; turn++) await play(id, `Turn ${turn} action`);
    reply = () => 'Summarised on request.';
    const res = await t.api('POST', `/api/campaigns/${id}/memory`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ enabled: true, summary: { fromTurn: 1, toTurn: 1, messages: 2 } });
    expect((await campaign(id)).rollingSummary).toBe('Summarised on request.');

    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json();
    expect(state).toMatchObject({ memoryEnabled: true, campaign: { rollingSummary: 'Summarised on request.' } });
  });
});

// ---------------------------------------------------------------- relationship notes

describe('relationship note condensing', () => {
  const adjust = (note: string) => ({ tools: [{ name: 'adjust_relationship', input: { npc_name: 'Mara', trust_delta: 1, note } }] });
  const mara = async (id: string) =>
    (await t.db.select({ rel: relationships }).from(relationships).innerJoin(npcs, eq(npcs.id, relationships.npcId)).where(and(eq(npcs.campaignId, id), eq(npcs.name, 'Mara Vell'))))[0]!.rel;

  it('condenses notes into bullets once enough have piled up, and undo restores them', async () => {
    const id = await newCampaign({ summaryInterval: 100 });
    for (const note of ['Shared a pie', 'Lent her a knife', 'Kept her secret']) await play(id, note, [adjust(note), { text: 'Mara nods.' }]);
    expect(requests.filter((r) => r.system.includes('bullets'))).toHaveLength(0);

    const before = await mara(id);
    reply = () => '* Kael and Mara grew close (turns 1-4)\n* He lent her a knife\n\nSome trailing commentary\n* She trusts him with secrets';
    await play(id, 'Warned her', [adjust('Warned her about the watch'), { text: 'Mara pales.' }]);
    const condense = requests.find((r) => r.system.includes('bullets'))!;
    expect(condense.prompt).toContain('NPC: Mara Vell');
    expect(condense.prompt).toContain('- (turn 4) Warned her about the watch');

    const after = await mara(id);
    expect(after.historyNotes).toBe('- Kael and Mara grew close (turns 1-4)\n- He lent her a knife\n- She trusts him with secrets');
    expect(after.notesSinceCondense).toBe(0);
    expect((await memoryEvents(id)).map((e) => e.humanReadable)).toEqual(["Condensed Mara Vell's history notes"]);

    await t.api('POST', `/api/campaigns/${id}/turns/undo`);
    const undone = await mara(id);
    expect(undone.historyNotes).toBe(before.historyNotes);
    expect(undone.notesSinceCondense).toBe(before.notesSinceCondense);
  });

  it('leaves the notes alone when the reply has no bullets', async () => {
    const id = await newCampaign({ summaryInterval: 100 });
    reply = () => 'I cannot help with that.';
    for (const note of ['One', 'Two', 'Three', 'Four']) await play(id, note, [adjust(note), { text: 'Mara nods.' }]);
    expect((await mara(id)).notesSinceCondense).toBe(4);
    expect(await memoryEvents(id)).toHaveLength(0);
  });

  it('parses common bullet styles', () => {
    expect(parseBullets('1. First\n2) Second\n• Third\n- Fourth')).toBe('- First\n- Second\n- Third\n- Fourth');
    expect(parseBullets('No bullets here.')).toBeNull();
    expect(parseBullets(Array.from({ length: 9 }, (_, i) => `- ${i}`).join('\n'))!.split('\n')).toHaveLength(6);
  });
});

// ---------------------------------------------------------------- search_past_events

describe('search_past_events', () => {
  it('finds folded story passages and past changes, falling back to any keyword', async () => {
    const id = await newCampaign({ historyWindow: 2, summaryInterval: 2 });
    await play(id, 'I ask about the drowned bell.', [
      { text: 'Old Haskel lowers his voice. "The drowned bell rings only for the dead," he says, tapping the silver key on the bar.' },
    ]);
    await play(id, 'I buy a lantern.', [
      { tools: [{ name: 'adjust_money', input: { delta: -3, reason: 'a storm lantern' } }] },
      { text: 'The lantern is yours.' },
    ]);
    await play(id, 'I head for the docks.'); // turns 1-2 fold here
    expect(await summarizedTurns(id)).toEqual([1, 2]);

    const { calls } = await play(id, 'What did Haskel say about the bell?', [
      { tools: [{ name: 'search_past_events', input: { query: 'drowned bell' } }, { name: 'search_past_events', input: { query: 'lantern kraken' } }] },
      { text: 'You remember.' },
    ]);
    const [bell, lantern] = toolResultsIn(calls[1]!).map((r) => JSON.parse(r.content as string));
    expect(bell.matched).toBe('all keywords');
    expect(bell.storyExcerpts).toContainEqual({ turn: 1, role: 'narrator', excerpt: expect.stringContaining('drowned bell rings only for the dead') });
    expect(bell.stateChanges).toEqual([]);
    // No passage has both words, so the search widens to either.
    expect(lantern.matched).toBe('any keyword');
    expect(lantern.stateChanges).toEqual([{ turn: 2, text: '-3 crowns (a storm lantern)' }]);
    // Memory bookkeeping never shows up as a past event.
    expect(JSON.stringify([bell, lantern])).not.toContain('Story so far');
  });

  it('does not return passages still in the transcript', async () => {
    const id = await newCampaign({ historyWindow: 8, summaryInterval: 10 });
    await play(id, 'I ask about the drowned bell.', [{ text: 'The drowned bell tolls.' }]);
    const { calls } = await play(id, 'The bell again?', [{ tools: [{ name: 'search_past_events', input: { query: 'drowned bell' } }] }, { text: 'Yes.' }]);
    const result = JSON.parse(toolResultsIn(calls[1]!)[0]!.content as string);
    expect(result.storyExcerpts).toEqual([]);
    expect(result.note).toMatch(/Nothing found/);
  });
});
