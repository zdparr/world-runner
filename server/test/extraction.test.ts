import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { and, eq } from 'drizzle-orm';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, type Step } from './fake-model';
import { campaigns, extractionRuns, npcs, relationships, stateEvents, storyEventEntities, storyEvents, storyThreads, turnDebug } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';
import { ExtractionOutput, nameSimilarity, normalizeName, resolveName, type StructuredFn } from '../src/engine/extract';

// The extraction pass: after each turn, what the narration established is recorded (people, events,
// threads, scene), the next turn's context sees it, undo removes it, and failures are logged and retried.

// ---------------------------------------------------------------- name resolution

describe('resolveName', () => {
  const roster = [
    { id: '1', name: 'Commissioner Rhea Okafor-Lindt', aliases: [], title: '' },
    { id: '2', name: 'Perpetua Vane', aliases: ['the harbor woman'], title: '' },
    { id: '3', name: 'Lady Cressida Aldgrave-Vane', aliases: [], title: 'Headmaster' },
    { id: '4', name: 'Mara Roan', aliases: [], title: '' },
    { id: '5', name: 'Mara Dutilh', aliases: [], title: '' },
    { id: '6', name: 'Dagny Holmqvist', aliases: [], title: 'Warden-Commander' },
  ];
  const id = (q: string) => {
    const hit = resolveName(q, roster);
    return hit && 'match' in hit ? hit.match.id : hit && 'ambiguous' in hit ? `ambiguous:${hit.ambiguous.map((e) => e.id).join(',')}` : null;
  };

  it('matches names, aliases, and titles regardless of case, accents, punctuation, or a leading "the"', () => {
    expect(id('dagny holmqvist')).toBe('6');
    expect(id('The Harbor Woman')).toBe('2');
    expect(id('the Warden-Commander')).toBe('6');
    expect(id('headmaster')).toBe('3');
    expect(normalizeName('  The Okafor–Lindt! ')).toBe('okafor lindt');
  });

  it('matches by distinctive name words, but only when they point at one person', () => {
    expect(id('Okafor-Lindt')).toBe('1');
    expect(id('the Commissioner')).toBe('1');
    expect(id('Perpetua')).toBe('2');
    expect(id('Mara')).toBe('ambiguous:4,5');
    expect(id('Vane')).toBe('ambiguous:2,3');
    expect(id('Mara Roan')).toBe('4');
  });

  it('tolerates a near spelling of a full name, and returns null for someone unknown', () => {
    expect(id('Dagny Holmquist')).toBe('6');
    expect(nameSimilarity('Dagny Holmqvist', 'Dagny Holmquist')).toBeGreaterThan(0.85);
    expect(id('Adaeze Okorie')).toBeNull();
    expect(id('')).toBeNull();
  });
});

describe('ExtractionOutput', () => {
  it('fills empty lists for kinds that did not happen, and rejects malformed records', () => {
    expect(ExtractionOutput.parse({})).toEqual({ npcs: [], locations: [], events: [], relationships: [], threads_opened: [], threads_resolved: [] });
    expect(ExtractionOutput.safeParse({ events: [{ type: 'death', summary: 'X died.', importance: 9, canon: true }] }).success).toBe(false);
    expect(ExtractionOutput.safeParse({ npcs: [{ name: '' }] }).success).toBe(false);
  });
});

// ---------------------------------------------------------------- the pass, end to end

/** A fake structured model: each call runs the next scripted reply against the prompt it was sent. */
function scriptedExtraction(replies: ((prompt: string) => unknown | Promise<unknown>)[]) {
  const prompts: string[] = [];
  const fn: StructuredFn = async ({ prompt }) => {
    prompts.push(prompt);
    const reply = replies[prompts.length - 1];
    if (!reply) throw new Error(`Extraction called ${prompts.length} times but only ${replies.length} replies were scripted`);
    return { input: await reply(prompt), inputTokens: 1_000, outputTokens: 200 };
  };
  return { fn, prompts };
}

/** The roster ref the extraction prompt gave someone, e.g. "N4". */
const refOf = (prompt: string, name: string) => new RegExp(`(?:^|\\n)([NL]\\d+): ${name}\\b`).exec(prompt)?.[1] ?? `(no ref for ${name})`;

const KASKE_CONVICTED = (prompt: string) => ({
  npcs: [
    {
      name: 'Rhea Okafor-Lindt',
      title: 'Police Commissioner',
      aliases: ['the Commissioner'],
      short_description: "Harrowmere's Police Commissioner, close-cropped grey hair.",
      met_player: true,
      first_meeting: 'Arrived at Tollgate Row to witness the arrest',
      location: refOf(prompt, 'Tollgate Row'),
    },
    { ref: refOf(prompt, 'Isidore Kaske'), name: 'Isidore Kaske', status: 'imprisoned', location: refOf(prompt, 'Tollgate Row') },
  ],
  events: [
    {
      type: 'status_change',
      summary: 'Isidore Kaske was convicted of the Archon’s murder and imprisoned at Tollgate Row.',
      importance: 5,
      canon: true,
      people: [refOf(prompt, 'Isidore Kaske')],
      places: [refOf(prompt, 'Tollgate Row')],
    },
  ],
  relationships: [{ person: refOf(prompt, 'Dagny Holmqvist'), note: 'Stood beside Remy while Kaske was led away.' }],
  threads_opened: [{ kind: 'mystery', summary: 'Who helped Kaske reach the Archon’s study?', importance: 4, people: [refOf(prompt, 'Isidore Kaske')] }],
  scene: { place: refOf(prompt, 'Tollgate Row'), time_of_day: 'night', present: [refOf(prompt, 'Dagny Holmqvist'), 'the Commissioner'] },
});

const NARRATION = 'Kaske is led down the iron stair in cuffs. Dagny Holmqvist stands beside you; the Police Commissioner, Rhea Okafor-Lindt, watches from the door.';

describe('story extraction', () => {
  let t: Awaited<ReturnType<typeof createTestApp>>;
  let extraction: ReturnType<typeof scriptedExtraction>;
  let replies: ((prompt: string) => unknown | Promise<unknown>)[];

  beforeAll(async () => {
    replies = [];
    extraction = scriptedExtraction(replies);
    // One app for the file: each test scripts its own replies onto the shared list.
    t = await createTestApp({ structured: (req) => extraction.fn(req), debugPrompts: true });
  }, 30_000);
  afterAll(async () => {
    await t?.close();
  });

  let seq = 0;
  const newCampaign = () => createFromTemplate(t.db, 'harrowmere', { name: `Extraction test ${++seq}`, includeCharacter: true });
  const script = (...next: ((prompt: string) => unknown | Promise<unknown>)[]) => {
    replies.length = 0;
    replies.push(...next);
    extraction.prompts.length = 0;
  };

  async function play(campaignId: string, content: string, steps: Step[]) {
    const model = scriptedModel(steps);
    t.setModel(model.stream);
    const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
    expect(parseSse(res.body).find((e) => e.type === 'error')).toBeUndefined();
    return model.calls;
  }
  const dynamicContext = (call: Anthropic.MessageStreamParams) => (call.system as Anthropic.TextBlockParam[])[1]!.text;
  const npc = async (id: string, name: string) => (await t.db.select().from(npcs).where(and(eq(npcs.campaignId, id), eq(npcs.name, name))))[0];
  const runs = (id: string) => t.db.select().from(extractionRuns).where(eq(extractionRuns.campaignId, id)).orderBy(extractionRuns.turnNumber);

  it('records new people, what changed for known ones, events, threads, notes, and the scene', async () => {
    const id = await newCampaign();
    script(KASKE_CONVICTED);
    await play(id, 'I watch them take Kaske away.', [{ text: NARRATION }]);
    await t.app.maintenance.idle();

    // The prompt the model saw: the roster with refs, the turn itself.
    expect(extraction.prompts[0]).toMatch(/N\d+: Isidore Kaske/);
    expect(extraction.prompts[0]).toContain(NARRATION);

    const commissioner = (await npc(id, 'Rhea Okafor-Lindt'))!;
    expect(commissioner).toMatchObject({ title: 'Police Commissioner', aliases: ['the Commissioner'], alive: true });
    const [rel] = await t.db.select().from(relationships).where(eq(relationships.npcId, commissioner.id));
    expect(rel).toMatchObject({ status: 'acquaintance', historyNotes: expect.stringContaining('First met: Arrived at Tollgate Row') });

    const kaske = (await npc(id, 'Isidore Kaske'))!;
    expect(kaske.status).toBe('imprisoned');
    const [event] = await t.db.select().from(storyEvents).where(eq(storyEvents.campaignId, id));
    expect(event).toMatchObject({ turnNumber: 1, type: 'status_change', importance: 5, immutable: true });
    const links = await t.db.select().from(storyEventEntities).where(eq(storyEventEntities.eventId, event!.id));
    expect(links.map((l) => l.npcId ?? l.locationId)).toEqual(expect.arrayContaining([kaske.id, kaske.locationId]));

    const dagny = (await npc(id, 'Dagny Holmqvist'))!;
    const [dagnyRel] = await t.db.select().from(relationships).where(eq(relationships.npcId, dagny.id));
    expect(dagnyRel!.historyNotes).toContain('(turn 1) Stood beside Remy while Kaske was led away.');

    const [thread] = await t.db.select().from(storyThreads).where(eq(storyThreads.campaignId, id));
    expect(thread).toMatchObject({ kind: 'mystery', openedTurn: 1, resolvedTurn: null, npcIds: [kaske.id] });

    const [row] = await t.db.select({ scene: campaigns.scene }).from(campaigns).where(eq(campaigns.id, id));
    expect(row!.scene).toEqual({ turn: 1, locationId: kaske.locationId, timeOfDay: 'night', presentNpcIds: [dagny.id, commissioner.id] });

    const [run] = await runs(id);
    expect(run).toMatchObject({ turnNumber: 1, status: 'applied', attempts: 1, error: '', inputTokens: 1_000 });
    expect(run!.applied).toMatchObject({ created: ['Rhea Okafor-Lindt'], updated: ['Isidore Kaske'], events: 1, threadsOpened: 1 });
    const logged = await t.db.select().from(stateEvents).where(and(eq(stateEvents.campaignId, id), eq(stateEvents.eventType, 'memory_extraction')));
    expect(logged[0]!.humanReadable).toBe('Story memory for turn 1: new: Rhea Okafor-Lindt; updated: Isidore Kaske; 1 event; threads +1/-0');
  });

  it('feeds the next turn: the narrator sees titles and statuses, finds people by alias, and the next extraction sees them too', async () => {
    const id = await newCampaign();
    script(KASKE_CONVICTED, () => ({}));
    await play(id, 'I watch them take Kaske away.', [{ text: NARRATION }]);
    const calls = await play(id, 'I ask the Commissioner whether Kaske will talk.', [{ text: 'She shrugs.' }]);
    await t.app.maintenance.idle();

    const context = dynamicContext(calls[0]!);
    // Found by her title alias, not her name, and the record carries what extraction learned.
    expect(context).toContain('## NPC: Rhea Okafor-Lindt');
    expect(context).toContain('"title":"Police Commissioner"');
    expect(context).toContain('"status":"imprisoned"');
    expect(context).toMatch(/Rhea Okafor-Lindt \(acquaintance, Police Commissioner, at Tollgate Row\)/);
    // The second extraction's roster shows the first one's results.
    expect(extraction.prompts[1]).toMatch(/N\d+: Isidore Kaske \(imprisoned; at L\d+\)/);
    expect(extraction.prompts[1]).toMatch(/T1: \[mystery\] Who helped Kaske/);
  });

  it('makes the next turn wait for a slow extraction, so its context is current', async () => {
    const id = await newCampaign();
    script(async (prompt) => {
      await new Promise((r) => setTimeout(r, 300));
      return KASKE_CONVICTED(prompt);
    }, () => ({}));
    await play(id, 'I watch them take Kaske away.', [{ text: NARRATION }]);
    const calls = await play(id, 'I turn to Rhea Okafor-Lindt.', [{ text: 'She nods.' }]);
    expect(dynamicContext(calls[0]!)).toContain('"title":"Police Commissioner"');
    await t.app.maintenance.idle();
  });

  it('undoing the turn removes everything its extraction recorded, and the replay is extracted afresh', async () => {
    const id = await newCampaign();
    const before = (await npc(id, 'Isidore Kaske'))!;
    script(KASKE_CONVICTED, KASKE_CONVICTED);
    await play(id, 'I watch them take Kaske away.', [{ text: NARRATION }]);
    await t.app.maintenance.idle();
    expect(await npc(id, 'Rhea Okafor-Lindt')).toBeDefined();

    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    expect(await npc(id, 'Rhea Okafor-Lindt')).toBeUndefined();
    expect(await npc(id, 'Isidore Kaske')).toMatchObject({ status: before.status, locationId: before.locationId });
    expect(await t.db.select().from(storyEvents).where(eq(storyEvents.campaignId, id))).toEqual([]);
    expect(await t.db.select().from(storyThreads).where(eq(storyThreads.campaignId, id))).toEqual([]);
    expect((await t.db.select({ scene: campaigns.scene }).from(campaigns).where(eq(campaigns.id, id)))[0]!.scene).toBeNull();
    expect(await runs(id)).toEqual([]);

    await play(id, 'I watch them take Kaske away, again.', [{ text: NARRATION }]);
    await t.app.maintenance.idle();
    expect(await runs(id)).toMatchObject([{ turnNumber: 1, status: 'applied', attempts: 1 }]);
    expect(await npc(id, 'Rhea Okafor-Lindt')).toBeDefined();
  });

  it('logs a failed or invalid extraction instead of dropping it, and retries it after the next turn', async () => {
    const id = await newCampaign();
    script(
      // Turn 1: the model call fails.
      () => {
        throw new Error('overloaded');
      },
      // After turn 2: turn 1 is retried and fails validation; turn 2 is extracted.
      () => ({ events: [{ type: 'death', summary: 'Nobody died.', importance: 11, canon: true }] }),
      () => ({}),
      // After turn 3: turn 1's third try lands; then turn 3.
      KASKE_CONVICTED,
      () => ({}),
    );
    await play(id, 'I watch them take Kaske away.', [{ text: NARRATION }]);
    await t.app.maintenance.idle();
    expect(await runs(id)).toMatchObject([{ turnNumber: 1, status: 'failed', attempts: 1, error: 'overloaded' }]);

    await play(id, 'I wait.', [{ text: 'Rain.' }]);
    await t.app.maintenance.idle();
    const [retry, second] = await runs(id);
    expect(retry).toMatchObject({ turnNumber: 1, status: 'failed', attempts: 2, error: expect.stringContaining('failed validation: events.0.importance') });
    // The invalid output is kept for diagnosis.
    expect(retry!.output).toMatchObject({ events: [{ importance: 11 }] });
    expect(second).toMatchObject({ turnNumber: 2, status: 'applied' });

    await play(id, 'I wait some more.', [{ text: 'More rain.' }]);
    await t.app.maintenance.idle();
    expect((await runs(id)).map((r) => [r.turnNumber, r.status, r.attempts])).toEqual([
      [1, 'applied', 3],
      [2, 'applied', 1],
      [3, 'applied', 1],
    ]);
    expect(await npc(id, 'Rhea Okafor-Lindt')).toBeDefined();
    expect(extraction.prompts[3]).toContain(NARRATION);
  });

  it("leaves relationships the narrator recorded itself alone, and never creates someone it can't tell apart", async () => {
    const id = await newCampaign();
    script((prompt) => ({
      npcs: [{ name: 'Hask', title: 'pack leader' }, { name: 'Ottoline' }],
      relationships: [{ person: refOf(prompt, 'Dagny Holmqvist'), note: 'A duplicate note.' }],
    }));
    // Two people share a surname, so "Hask" alone could be either.
    await t.api('POST', `/api/campaigns/${id}/npcs`, { name: 'Kit Hask' });
    await play(id, 'I thank Dagny.', [
      { tools: [{ name: 'adjust_relationship', input: { npc_name: 'Dagny', affinity_delta: 2, note: 'Thanked her.' } }] },
      { text: 'Dagny nods.' },
    ]);
    await t.app.maintenance.idle();

    const dagny = (await npc(id, 'Dagny Holmqvist'))!;
    const [rel] = await t.db.select().from(relationships).where(eq(relationships.npcId, dagny.id));
    expect(rel!.historyNotes).toContain('Thanked her.');
    expect(rel!.historyNotes).not.toContain('A duplicate note.');
    expect(await npc(id, 'Hask')).toBeUndefined();
    expect(await npc(id, 'Ottoline')).toBeUndefined(); // the same person as Ottoline Sarrazin
    const [run] = await runs(id);
    expect((run!.applied as { warnings: string[] }).warnings).toEqual(expect.arrayContaining([expect.stringContaining('"Hask" could be')]));
  });

  it('stores the assembled prompt when DEBUG_PROMPTS is on', async () => {
    const id = await newCampaign();
    script(() => ({}));
    const calls = await play(id, 'I look around.', [{ text: 'Sawdust.' }]);
    await t.app.maintenance.idle();
    const [debug] = await t.db.select({ prompt: turnDebug.prompt }).from(turnDebug).where(eq(turnDebug.campaignId, id));
    expect(debug!.prompt).toEqual({ system: calls[0]!.system, messages: [{ role: 'user', content: 'I look around.' }] });
  });
});

describe('prefetching people from the text', () => {
  let t: Awaited<ReturnType<typeof createTestApp>>;
  beforeAll(async () => {
    t = await createTestApp();
  }, 30_000);
  afterAll(async () => {
    await t?.close();
  });

  it("doesn't fetch everyone who shares a surname, but still finds a person by full name or alias", async () => {
    const id = await createFromTemplate(t.db, 'harrowmere', { name: 'Surnames', includeCharacter: true });
    await t.api('POST', `/api/campaigns/${id}/npcs`, { name: 'Perpetua Vane', aliases: ['the harbor woman'] });
    const turn = async (content: string) => {
      const model = scriptedModel([{ text: 'Rain.' }]);
      t.setModel(model.stream);
      await t.api('POST', `/api/campaigns/${id}/turns`, { content });
      return (model.calls[0]!.system as Anthropic.TextBlockParam[])[1]!.text;
    };
    const vane = await turn('I walk up to Vane House.');
    expect(vane).not.toContain('## NPC: Perpetua Vane');
    expect(vane).not.toContain('## NPC: Lady Cressida Aldgrave-Vane');
    expect(await turn('I ask about the harbor woman.')).toContain('## NPC: Perpetua Vane');
    expect(await turn('I bow to Cressida.')).toContain('## NPC: Lady Cressida Aldgrave-Vane');
  });
});
