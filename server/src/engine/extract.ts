import { and, asc, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { FastifyBaseLogger } from 'fastify';
import { NPC_ROLES, NPC_STATUSES, STORY_EVENT_TYPES, THREAD_KINDS, type SceneState, type ToolCallRecord } from '@narrator/shared';
import type { Db } from '../db/client';
import { campaigns, extractionRuns, locations, messages, npcs, playerCharacter, storyThreads, turnDebug } from '../db/schema';
import { applyRelationship, type CampaignRow, type EngineContext } from './game';
import { Mutator } from './mutator';

/**
 * The extraction pass: after each turn, a cheap model reads the player's move and the narration and
 * records what the story established: people (new ones, and what changed for known ones), places,
 * events for the story ledger, open threads, and the scene. This is what keeps a 500-turn campaign
 * from forgetting who died, who holds which office, and what was promised.
 *
 * It runs off the request path. Its writes go through a Mutator tagged with the turn they describe,
 * so undoing that turn removes them too. Every attempt is logged in extraction_runs, failures
 * included, and failed turns are retried after later turns.
 */

export type StructuredFn = (request: {
  system: string;
  prompt: string;
  maxTokens: number;
  tool: { name: string; description: string; inputSchema: Record<string, unknown> };
}) => Promise<{ input: unknown; inputTokens: number; outputTokens: number }>;

/** How far back a run looks for turns still to extract (older gaps are the backfill's job). */
const CATCH_UP_TURNS = 5;
/** Attempts per turn before giving up on it (the failure stays logged). */
export const MAX_ATTEMPTS = 3;
/** Roster sizes sent to the model. */
const MAX_ROSTER_NPCS = 200;
const MAX_DETAILED_NPCS = 8;
const MAX_OPEN_THREADS = 40;
const MAX_TOOL_INPUT_CHARS = 300;

// ---------------------------------------------------------------- output schema

const Text = (max: number) => z.string().trim().max(max);
const RefOrName = z.string().trim().min(1).max(160);

export const ExtractionOutput = z.object({
  npcs: z
    .array(
      z.object({
        ref: z.string().trim().max(10).optional().describe('Roster ref (e.g. "N3") when this is someone already in the roster; omit for a new person'),
        name: Text(160).min(1).describe('Their full name as the story knows it'),
        aliases: z.array(Text(80).min(1)).max(8).optional().describe('Other names the story used for them: nicknames, short forms, epithets'),
        title: Text(120).optional().describe('Office, rank, or title they hold now'),
        role: z.enum(NPC_ROLES).optional().describe('"major" for someone central to the story'),
        short_description: Text(500).optional().describe('Who they are, in one or two sentences'),
        appearance: Text(500).optional(),
        personality: Text(500).optional().describe('Temperament and how they talk'),
        goals: Text(500).optional().describe('What they want'),
        faction: Text(120).optional(),
        location: RefOrName.optional().describe('Where they are now: a place ref (e.g. "L2") or name'),
        status: z.enum(NPC_STATUSES).optional().describe('Set when it changed: captured, gone missing, freed (active), left the story (departed)'),
        died: z.boolean().optional().describe('true only if the narration shows them dying this turn'),
        met_player: z.boolean().optional().describe('For a new person: true if they dealt with the player character this turn'),
        first_meeting: Text(300).optional().describe('For a new person met this turn: how they met'),
      }),
    )
    .max(20)
    .default([]),
  locations: z
    .array(
      z.object({
        ref: z.string().trim().max(10).optional().describe('Roster ref (e.g. "L2") for a known place; omit for a new one'),
        name: Text(160).min(1),
        description: Text(800).optional().describe('For a new place: what it is like'),
        current_state: Text(500).optional().describe('How the place stands now, when the story changed it'),
      }),
    )
    .max(10)
    .default([]),
  events: z
    .array(
      z.object({
        type: z.enum(STORY_EVENT_TYPES),
        summary: Text(400).min(1).describe('One past-tense sentence with full names'),
        importance: z.number().int().min(1).max(5),
        canon: z.boolean().describe('true for hard facts later narration must never contradict'),
        people: z.array(RefOrName).max(10).default([]).describe('Refs (or names) of everyone involved, not the player character'),
        places: z.array(RefOrName).max(5).default([]),
      }),
    )
    .max(12)
    .default([]),
  relationships: z
    .array(
      z.object({
        person: RefOrName,
        note: Text(300).min(1).describe('What passed between them that this person would remember'),
        status: Text(40).optional().describe('Only if the relationship changed kind, from their side: ally, rival, owes you'),
      }),
    )
    .max(10)
    .default([]),
  threads_opened: z
    .array(
      z.object({
        kind: z.enum(THREAD_KINDS),
        summary: Text(300).min(1),
        importance: z.number().int().min(1).max(5),
        people: z.array(RefOrName).max(8).default([]),
      }),
    )
    .max(6)
    .default([]),
  threads_resolved: z
    .array(z.object({ ref: z.string().trim().min(1).max(10).describe('Open thread ref, e.g. "T4"'), resolution: Text(300).min(1) }))
    .max(10)
    .default([]),
  scene: z
    .object({
      place: RefOrName.optional().describe('Where the player character is at the end of the turn'),
      time_of_day: Text(60).optional(),
      present: z.array(RefOrName).max(20).default([]).describe('Refs of the people with the player character at the end of the turn'),
    })
    .optional(),
});
export type ExtractionOutput = z.infer<typeof ExtractionOutput>;

export const EXTRACTION_TOOL = {
  name: 'record_turn',
  description: "Record what this turn of the story established. Call it exactly once; use empty lists when nothing of that kind happened.",
  inputSchema: (() => {
    const { $schema: _ignored, ...schema } = z.toJSONSchema(ExtractionOutput, { io: 'input' }) as Record<string, unknown>;
    return schema;
  })(),
};

const SYSTEM = `You keep the continuity ledger of a long interactive story run by an AI narrator. After each turn you read what the player did and what the narrator wrote, and record what the narration established, so it can still be remembered hundreds of turns later. Call record_turn exactly once.

- Record only what this turn shows actually happening or being revealed: not plans, guesses, threats not carried out, dreams, or rumors (record a claim as "X claimed ..." only if it matters).
- Be sparing. Most turns have zero to three events. Skip small talk, atmosphere, and mechanics the narrator's tool calls already recorded (money, items, XP, rolls, travel), though you may record the story meaning of one (a death, a betrayal, a gift that matters).
- People: refer to anyone in the roster by their ref (N3). Add a new person only when the narration names a specific individual who could matter again, never an unnamed extra ("a guard"). Before adding someone, look for the same person in the roster under another name or title (a commissioner already listed is probably the same commissioner): if found, use their ref and put the new name in aliases.
- Update a known person only with what changed or was learned this turn, or to fill a field the roster marks as empty: an office or title they now hold, a name they were called, being captured, going missing, freed, or leaving (status), dying (died: true), where they are now.
- Places: refer to known places by ref (L2). Add a new place only if the character goes there or it is clearly a specific named place. Set current_state when the story changes a place.
- Events: one past-tense sentence each, with full names. importance: 1 color, 2 minor, 3 notable, 4 major, 5 changes the whole story. canon: true for hard facts later narration must never contradict (deaths, true identities, who holds an office, irreversible acts, secrets revealed); false for softer ones.
- Relationships: a short note of what passed between the player character and a person this turn, if it mattered to them. Skip people the narrator already recorded with adjust_relationship or create_npc this turn (see the tool calls).
- Threads: open one for each new unresolved hook (a promise made, a mystery raised, an enemy made, a debt owed, a goal set) that isn't already open. Resolve an open thread by its ref when this turn settles it.
- Scene: where the player character is at the end of the turn, the time of day if the narration makes it clear, and who is with them.`;

// ---------------------------------------------------------------- name resolution

const NAME_STOP_WORDS = new Set(['the', 'and', 'of', 'mr', 'mrs', 'ms', 'dr', 'old', 'young']);

/** Lower case, accents and punctuation stripped, a leading "the" dropped: "The Okafor-Lindt" -> "okafor lindt". */
export function normalizeName(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/^the /, '');
}

const tokensOf = (s: string) => normalizeName(s).split(' ').filter((t) => t.length >= 3 && !NAME_STOP_WORDS.has(t));

function bigrams(s: string): Map<string, number> {
  const padded = ` ${s} `;
  const grams = new Map<string, number>();
  for (let i = 0; i < padded.length - 1; i++) {
    const g = padded.slice(i, i + 2);
    grams.set(g, (grams.get(g) ?? 0) + 1);
  }
  return grams;
}

/** Sørensen–Dice similarity of two normalized names (0..1). */
export function nameSimilarity(a: string, b: string): number {
  const x = bigrams(normalizeName(a));
  const y = bigrams(normalizeName(b));
  let overlap = 0;
  let total = 0;
  for (const [g, n] of x) {
    overlap += Math.min(n, y.get(g) ?? 0);
    total += n;
  }
  for (const n of y.values()) total += n;
  return total === 0 ? 0 : (2 * overlap) / total;
}

export interface RosterEntry {
  id: string;
  name: string;
  aliases: string[];
  title: string;
}

export type Resolution<T> = { match: T } | { ambiguous: T[] } | null;

/**
 * Find who a name refers to: exact name, then an alias, then a title ("the Commissioner"), then
 * name words ("Okafor-Lindt", "Rhea"), then a close spelling. A match must be unique; several
 * candidates come back as ambiguous rather than a guess.
 */
export function resolveName<T extends RosterEntry>(query: string, roster: T[]): Resolution<T> {
  const q = normalizeName(query);
  if (!q) return null;
  const unique = (found: T[]): Resolution<T> | undefined => {
    const distinct = [...new Map(found.map((e) => [e.id, e])).values()];
    if (distinct.length === 1) return { match: distinct[0]! };
    if (distinct.length > 1) return { ambiguous: distinct };
    return undefined;
  };

  const byName = unique(roster.filter((e) => normalizeName(e.name) === q));
  if (byName) return byName;
  const byAlias = unique(roster.filter((e) => e.aliases.some((a) => normalizeName(a) === q)));
  if (byAlias) return byAlias;
  const byTitle = unique(roster.filter((e) => e.title && normalizeName(e.title) === q));
  if (byTitle) return byTitle;

  // Name words: every distinctive word of the query is a word of their name, an alias, or their title.
  const qTokens = tokensOf(query);
  if (qTokens.length > 0) {
    const words = (e: T) => new Set([...tokensOf(e.name), ...e.aliases.flatMap(tokensOf), ...tokensOf(e.title)]);
    const byWords = unique(roster.filter((e) => qTokens.every((t) => words(e).has(t))));
    if (byWords) return byWords;
  }

  // A near spelling of a full name ("Okafor Lind", "Brannagh Coil").
  const scored = roster.map((e) => ({ e, score: Math.max(nameSimilarity(q, e.name), ...e.aliases.map((a) => nameSimilarity(q, a))) })).sort((a, b) => b.score - a.score);
  const [best, second] = scored;
  if (best && best.score >= 0.85 && (!second || best.score - second.score >= 0.1)) return { match: best.e };
  return null;
}

// ---------------------------------------------------------------- input

interface TurnInput {
  campaign: CampaignRow;
  turnNumber: number;
  messageId: number;
  prompt: string;
  /** Short refs the model sees, mapped back to ids. */
  refs: Map<string, string>;
  /** NPCs the narrator already recorded a relationship for this turn (extraction leaves those alone). */
  narratorTouchedNpcs: Set<string>;
}

const WRITE_TOOLS_SKIPPED = new Set(['skill_check']);

function compactInput(input: unknown): string {
  const text = JSON.stringify(input);
  return text.length > MAX_TOOL_INPUT_CHARS ? `${text.slice(0, MAX_TOOL_INPUT_CHARS)}…` : text;
}

/** Build the model's input for one turn; null if the turn has no narration (undone, or never finished). */
export async function buildExtractionInput(db: Db, campaignId: string, turnNumber: number): Promise<TurnInput | null> {
  const [campaign] = (await db.select().from(campaigns).where(eq(campaigns.id, campaignId))) as CampaignRow[];
  if (!campaign) return null;
  const turnMessages = await db
    .select({ id: messages.id, role: messages.role, content: messages.content })
    .from(messages)
    .where(and(eq(messages.campaignId, campaignId), eq(messages.turnNumber, turnNumber)))
    .orderBy(asc(messages.id));
  const narration = turnMessages.find((m) => m.role === 'narrator');
  if (!narration) return null;
  const playerMessage = turnMessages.find((m) => m.role === 'player')?.content ?? '';
  const [pc] = await db.select({ name: playerCharacter.name, locationId: playerCharacter.currentLocationId }).from(playerCharacter).where(eq(playerCharacter.campaignId, campaignId));

  const [debug] = await db.select({ toolCalls: turnDebug.toolCalls }).from(turnDebug).where(and(eq(turnDebug.campaignId, campaignId), eq(turnDebug.turnNumber, turnNumber)));
  const writes = ((debug?.toolCalls ?? []) as ToolCallRecord[]).filter((c) => c.ok && !c.name.startsWith('get_') && !c.name.startsWith('search_') && !WRITE_TOOLS_SKIPPED.has(c.name));

  const refs = new Map<string, string>();
  const npcRows = await db.select().from(npcs).where(eq(npcs.campaignId, campaignId)).orderBy(desc(npcs.updatedAt)).limit(MAX_ROSTER_NPCS);
  const locRows = await db.select().from(locations).where(eq(locations.campaignId, campaignId)).orderBy(asc(locations.createdAt));
  const locRef = new Map<string, string>();
  locRows.forEach((l, i) => {
    refs.set(`L${i + 1}`, l.id);
    locRef.set(l.id, `L${i + 1}`);
  });
  const npcRef = new Map<string, string>();
  npcRows.forEach((n, i) => {
    refs.set(`N${i + 1}`, n.id);
    npcRef.set(n.id, `N${i + 1}`);
  });

  // People named this turn get a full card, so the model can fill gaps and catch what changed.
  const turnText = `${playerMessage}\n${narration.content}`;
  const named = npcRows.filter((n) => [n.name, ...n.aliases, n.title].filter(Boolean).some((name) => mentionedIn(turnText, name, npcRows))).slice(0, MAX_DETAILED_NPCS);

  const roster = npcRows.map((n) => {
    const facts = [
      n.title ? `title: ${n.title}` : '',
      n.aliases.length > 0 ? `aka ${n.aliases.join(', ')}` : '',
      n.alive ? (n.status !== 'active' ? n.status : '') : 'DEAD',
      n.locationId && locRef.has(n.locationId) ? `at ${locRef.get(n.locationId)}` : '',
    ].filter(Boolean);
    return `${npcRef.get(n.id)}: ${n.name}${facts.length > 0 ? ` (${facts.join('; ')})` : ''}`;
  });
  const cards = named.map((n) => {
    const empty = (['short_description', 'appearance', 'personality', 'goals', 'title'] as const).filter((f) => !(f === 'short_description' ? n.shortDescription : n[f]).trim());
    return [
      `${npcRef.get(n.id)} ${n.name}`,
      n.shortDescription && `description: ${n.shortDescription}`,
      n.appearance && `appearance: ${n.appearance}`,
      n.personality && `personality: ${n.personality}`,
      n.goals && `goals: ${n.goals}`,
      n.faction && `faction: ${n.faction}`,
      `role: ${n.role}`,
      empty.length > 0 && `empty (fill only if this turn shows it): ${empty.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n  ');
  });

  const threads = await db
    .select()
    .from(storyThreads)
    .where(and(eq(storyThreads.campaignId, campaignId), isNull(storyThreads.resolvedTurn)))
    .orderBy(desc(storyThreads.importance), desc(storyThreads.openedTurn))
    .limit(MAX_OPEN_THREADS);
  threads.forEach((t, i) => refs.set(`T${i + 1}`, t.id));

  const scene = campaign.scene;
  const sceneLine = scene
    ? `At ${scene.locationId ? (locRef.get(scene.locationId) ?? 'unknown') : 'unknown'}${scene.timeOfDay ? `, ${scene.timeOfDay}` : ''}; present: ${scene.presentNpcIds.map((id) => npcRef.get(id)).filter(Boolean).join(', ') || 'nobody'}`
    : 'Not recorded yet.';

  const narratorTouchedNpcs = new Set<string>();
  for (const c of writes) {
    const input = c.input as { npc_name?: string; name?: string; first_meeting?: string };
    const name = c.name === 'adjust_relationship' ? input.npc_name : c.name === 'create_npc' && input.first_meeting ? input.name : undefined;
    const hit = name ? resolveName(name, npcRows) : null;
    if (hit && 'match' in hit) narratorTouchedNpcs.add(hit.match.id);
  }

  const prompt = [
    `# Player character\n${pc?.name ?? 'the player character'}, now at ${pc?.locationId ? (locRef.get(pc.locationId) ?? 'unknown') : 'unknown'}`,
    `# People (roster)\n${roster.join('\n') || 'nobody yet'}`,
    cards.length > 0 ? `# People named this turn (current records)\n${cards.join('\n')}` : '',
    `# Places\n${locRows.map((l) => `${locRef.get(l.id)}: ${l.name}${l.currentState ? ` (now: ${l.currentState})` : ''}`).join('\n') || 'none yet'}`,
    `# Open threads\n${threads.map((t, i) => `T${i + 1}: [${t.kind}] ${t.summary}`).join('\n') || 'none'}`,
    `# Scene before this turn\n${sceneLine}`,
    `# What the narrator already recorded with tools this turn\n${writes.map((c) => `- ${c.name} ${compactInput(c.input)}`).join('\n') || 'nothing'}`,
    `# Turn ${turnNumber}\n## Player (as ${pc?.name ?? 'the player character'})\n${playerMessage}\n\n## Narrator\n${narration.content}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return { campaign, turnNumber, messageId: narration.id, prompt, refs, narratorTouchedNpcs };
}

/** Whether a turn's text names this person: their full name, or a word of it no one else shares. */
function mentionedIn(text: string, name: string, everyone: { name: string; aliases: string[] }[]): boolean {
  const hay = ` ${normalizeName(text)} `;
  const n = normalizeName(name);
  if (n.length >= 3 && hay.includes(` ${n} `)) return true;
  return tokensOf(name).some(
    (t) => t.length >= 4 && hay.includes(` ${t} `) && everyone.filter((e) => [e.name, ...e.aliases].some((x) => tokensOf(x).includes(t))).length === 1,
  );
}

// ---------------------------------------------------------------- apply

export interface AppliedExtraction {
  created: string[];
  updated: string[];
  places: string[];
  events: number;
  relationships: string[];
  threadsOpened: number;
  threadsResolved: number;
  scene: boolean;
  warnings: string[];
}

const join = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];

/**
 * Apply a validated extraction in one transaction. Returns null (and changes nothing) when the turn
 * it describes was undone or replayed while the model was working.
 */
export async function applyExtraction(db: Db, input: TurnInput, out: ExtractionOutput): Promise<AppliedExtraction | null> {
  const { campaign, turnNumber } = input;
  return db.transaction(async (tx) => {
    // Serialize with turns, undo, and other memory jobs on this campaign.
    const [locked] = (await tx.select().from(campaigns).where(eq(campaigns.id, campaign.id)).for('update')) as CampaignRow[];
    if (!locked || locked.turnCount < turnNumber) return null;
    const [still] = await tx.select({ id: messages.id }).from(messages).where(eq(messages.id, input.messageId));
    if (!still) return null;

    const mutator = new Mutator(tx, campaign.id, turnNumber);
    const ctx: EngineContext = {
      db: tx,
      campaign: locked,
      turnNumber,
      mutator,
      nextRollIndex: () => 0,
      record: async (event) => {
        const row = await mutator.commit(event);
        return row ? { id: row.id, eventType: event.eventType, humanReadable: event.humanReadable, details: event.details } : null;
      },
    };
    const applied: AppliedExtraction = { created: [], updated: [], places: [], events: 0, relationships: [], threadsOpened: 0, threadsResolved: 0, scene: false, warnings: [] };

    let npcRows = await tx.select().from(npcs).where(eq(npcs.campaignId, campaign.id));
    let locRows = await tx.select().from(locations).where(eq(locations.campaignId, campaign.id));
    const byRef = <T extends { id: string }>(rows: T[], ref: string | undefined, prefix: string) =>
      ref && new RegExp(`^${prefix}\\d+$`, 'i').test(ref.trim()) ? rows.find((r) => r.id === input.refs.get(ref.trim().toUpperCase())) : undefined;
    const findLoc = (refOrName: string | undefined) => {
      if (!refOrName) return undefined;
      const found = byRef(locRows, refOrName, 'L');
      if (found) return found;
      const hit = resolveName(refOrName, locRows.map((l) => ({ ...l, aliases: [], title: '' })));
      return hit && 'match' in hit ? hit.match : undefined;
    };
    const findNpcRow = (refOrName: string | undefined) => {
      if (!refOrName) return undefined;
      const found = byRef(npcRows, refOrName, 'N');
      if (found) return found;
      const hit = resolveName(refOrName, npcRows);
      if (hit && 'ambiguous' in hit) applied.warnings.push(`"${refOrName}" could be ${hit.ambiguous.map((n) => n.name).join(' or ')}; left unlinked`);
      return hit && 'match' in hit ? hit.match : undefined;
    };

    // Places first, so people can be placed in new ones.
    for (const p of out.locations) {
      const existing = findLoc(p.ref) ?? findLoc(p.name);
      if (existing) {
        const patch: Record<string, unknown> = {};
        if (p.current_state && p.current_state !== existing.currentState) patch.currentState = p.current_state;
        if (p.description && !existing.description.trim()) patch.description = p.description;
        if (Object.keys(patch).length > 0) {
          await mutator.update('locations', { id: existing.id }, patch);
          applied.places.push(existing.name);
        }
      } else if (!p.ref) {
        await mutator.insert('locations', { name: p.name, description: p.description ?? '', currentState: p.current_state ?? '', purpose: '', tags: [] });
        applied.places.push(p.name);
      } else {
        applied.warnings.push(`unknown place ref ${p.ref} (${p.name})`);
      }
    }
    if (applied.places.length > 0) locRows = await tx.select().from(locations).where(eq(locations.campaignId, campaign.id));

    for (const p of out.npcs) {
      const existing = byRef(npcRows, p.ref, 'N') ?? (p.ref ? undefined : findNpcRow(p.name));
      const loc = p.location ? findLoc(p.location) : undefined;
      if (p.location && !loc) applied.warnings.push(`unknown place "${p.location}" for ${p.name}`);

      if (existing) {
        const patch: Record<string, unknown> = {};
        // A different name for someone known becomes an alias.
        const newNames = [...(p.aliases ?? []), ...(normalizeName(p.name) !== normalizeName(existing.name) && !resolvesTo(p.name, existing, npcRows) ? [p.name] : [])];
        const aliases = join([...existing.aliases, ...newNames]).filter((a) => normalizeName(a) !== normalizeName(existing.name));
        if (aliases.length !== existing.aliases.length) patch.aliases = aliases;
        if (p.title && p.title !== existing.title) patch.title = p.title;
        if (p.role && p.role !== existing.role) patch.role = p.role;
        if (p.short_description) patch.shortDescription = p.short_description;
        if (p.appearance) patch.appearance = p.appearance;
        if (p.personality) patch.personality = p.personality;
        if (p.goals) patch.goals = p.goals;
        if (p.faction && !existing.faction) patch.faction = p.faction;
        if (loc && loc.id !== existing.locationId) patch.locationId = loc.id;
        if (p.status && p.status !== existing.status) patch.status = p.status;
        if (p.died && existing.alive) patch.alive = false;
        const changed = Object.entries(patch).some(([k, v]) => JSON.stringify(v) !== JSON.stringify((existing as Record<string, unknown>)[k]));
        if (changed) {
          await mutator.update('npcs', { id: existing.id }, patch);
          applied.updated.push(existing.name);
        }
      } else if (p.ref) {
        applied.warnings.push(`unknown person ref ${p.ref} (${p.name})`);
      } else {
        // Someone new, unless the name could be someone already recorded: never guess, never duplicate.
        const hit = resolveName(p.name, npcRows);
        if (hit && 'ambiguous' in hit) {
          applied.warnings.push(`"${p.name}" could be ${hit.ambiguous.map((n) => n.name).join(' or ')}; not created`);
          continue;
        }
        const doubles = npcRows.filter(
          (n) => (p.title && n.title && normalizeName(n.title) === normalizeName(p.title) && n.alive) || nameSimilarity(n.name, p.name) >= 0.7,
        );
        const note = doubles.length > 0 ? `Possibly the same person as ${doubles.map((d) => d.name).join(' or ')}: check before treating them as different people.` : '';
        if (note) applied.warnings.push(`${p.name}: ${note}`);
        await mutator.insert('npcs', {
          name: p.name,
          shortDescription: p.short_description ?? '',
          faction: p.faction ?? '',
          locationId: loc?.id ?? null,
          alive: !p.died,
          notes: note,
          aliases: join(p.aliases ?? []),
          title: p.title ?? '',
          role: p.role ?? 'minor',
          status: p.status ?? 'active',
          appearance: p.appearance ?? '',
          personality: p.personality ?? '',
          goals: p.goals ?? '',
        });
        applied.created.push(p.name);
        npcRows = await tx.select().from(npcs).where(eq(npcs.campaignId, campaign.id));
        if (p.met_player) {
          await applyRelationship(ctx, p.name, 0, 0, `First met: ${p.first_meeting || 'this turn'}`, 'acquaintance');
          input.narratorTouchedNpcs.add(npcRows.find((n) => n.name === p.name)!.id);
        }
      }
    }
    if (applied.updated.length > 0) npcRows = await tx.select().from(npcs).where(eq(npcs.campaignId, campaign.id));

    for (const e of out.events) {
      const row = await mutator.insert<{ id: string }>('story_events', {
        turnNumber,
        type: e.type,
        summary: e.summary,
        importance: e.importance,
        immutable: e.canon,
      });
      const people = join(e.people.map((r) => findNpcRow(r)?.id ?? ''));
      const places = join(e.places.map((r) => findLoc(r)?.id ?? ''));
      for (const npcId of people) await mutator.insert('story_event_entities', { eventId: row.id, npcId });
      for (const locationId of places) await mutator.insert('story_event_entities', { eventId: row.id, locationId });
      applied.events++;
    }

    for (const r of out.relationships) {
      const npc = findNpcRow(r.person);
      if (!npc) {
        applied.warnings.push(`relationship note for unknown person "${r.person}"`);
        continue;
      }
      if (input.narratorTouchedNpcs.has(npc.id)) continue;
      await applyRelationship(ctx, npc.name, 0, 0, r.note, r.status);
      applied.relationships.push(npc.name);
    }

    const open = await tx.select().from(storyThreads).where(and(eq(storyThreads.campaignId, campaign.id), isNull(storyThreads.resolvedTurn)));
    for (const t of out.threads_opened) {
      if (open.some((o) => normalizeName(o.summary) === normalizeName(t.summary))) continue;
      await mutator.insert('story_threads', {
        kind: t.kind,
        summary: t.summary,
        importance: t.importance,
        npcIds: join(t.people.map((r) => findNpcRow(r)?.id ?? '')),
        openedTurn: turnNumber,
      });
      applied.threadsOpened++;
    }
    for (const t of out.threads_resolved) {
      const id = input.refs.get(t.ref.trim().toUpperCase());
      const thread = id ? open.find((o) => o.id === id) : undefined;
      if (!thread) {
        applied.warnings.push(`unknown thread ref ${t.ref}`);
        continue;
      }
      await mutator.update('story_threads', { id: thread.id }, { resolvedTurn: turnNumber, resolution: t.resolution });
      applied.threadsResolved++;
    }

    if (out.scene) {
      const place = findLoc(out.scene.place);
      const scene: SceneState = {
        turn: turnNumber,
        locationId: place?.id ?? locked.scene?.locationId ?? null,
        timeOfDay: out.scene.time_of_day ?? '',
        presentNpcIds: join(out.scene.present.map((r) => findNpcRow(r)?.id ?? '')),
      };
      await mutator.update('campaigns', { id: campaign.id }, { scene });
      applied.scene = true;
    }

    const parts = [
      applied.created.length > 0 ? `new: ${applied.created.join(', ')}` : '',
      applied.updated.length > 0 ? `updated: ${applied.updated.join(', ')}` : '',
      applied.events > 0 ? `${applied.events} event${applied.events === 1 ? '' : 's'}` : '',
      applied.threadsOpened + applied.threadsResolved > 0 ? `threads +${applied.threadsOpened}/-${applied.threadsResolved}` : '',
    ].filter(Boolean);
    await mutator.commit({
      eventType: 'memory_extraction',
      humanReadable: `Story memory for turn ${turnNumber}${parts.length > 0 ? `: ${parts.join('; ')}` : ''}`,
      details: { turn: turnNumber, ...applied },
    });
    return applied;
  });
}

/** Does `name` already resolve to this NPC (so it adds nothing as an alias)? */
function resolvesTo(name: string, npc: RosterEntry, roster: RosterEntry[]): boolean {
  const hit = resolveName(name, roster);
  return Boolean(hit && 'match' in hit && hit.match.id === npc.id);
}

// ---------------------------------------------------------------- run

export interface ExtractionDeps {
  db: Db;
  structured: StructuredFn;
  model: string;
  log: FastifyBaseLogger;
}

/** Turns of this campaign that still need extracting, oldest first. */
export async function dueTurns(db: Db, campaignId: string): Promise<number[]> {
  const [campaign] = await db.select({ turnCount: campaigns.turnCount }).from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign || campaign.turnCount < 1) return [];
  const latest = campaign.turnCount;
  // Extraction starts with the first turn it saw; earlier history is the backfill's job.
  const [first] = await db.select({ turn: sql<number | null>`min(${extractionRuns.turnNumber})` }).from(extractionRuns).where(eq(extractionRuns.campaignId, campaignId));
  const from = Math.max(1, latest - CATCH_UP_TURNS + 1, first?.turn ?? latest);
  const runs = await db.select().from(extractionRuns).where(and(eq(extractionRuns.campaignId, campaignId), gte(extractionRuns.turnNumber, from)));
  const narrations = await db
    .select({ id: messages.id, turn: messages.turnNumber })
    .from(messages)
    .where(and(eq(messages.campaignId, campaignId), eq(messages.role, 'narrator'), gte(messages.turnNumber, from)));
  const due: number[] = [];
  for (let turn = from; turn <= latest; turn++) {
    const narration = narrations.find((m) => m.turn === turn);
    if (!narration) continue;
    const run = runs.find((r) => r.turnNumber === turn);
    if (!run || run.messageId !== narration.id || (run.status === 'failed' && run.attempts < MAX_ATTEMPTS)) due.push(turn);
  }
  return due;
}

/** Extract one turn: build the input, ask the model, validate, apply, and log the run. */
export async function extractTurn(deps: ExtractionDeps, campaignId: string, turnNumber: number): Promise<AppliedExtraction | null> {
  const input = await buildExtractionInput(deps.db, campaignId, turnNumber);
  if (!input) return null;
  const started = Date.now();
  let output: unknown = null;
  let tokens = { inputTokens: 0, outputTokens: 0 };
  try {
    const reply = await deps.structured({ system: SYSTEM, prompt: input.prompt, maxTokens: 4_000, tool: EXTRACTION_TOOL });
    output = reply.input;
    tokens = { inputTokens: reply.inputTokens, outputTokens: reply.outputTokens };
    const parsed = ExtractionOutput.safeParse(output);
    if (!parsed.success) {
      throw new Error(`Extraction output failed validation: ${parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    }
    const applied = await applyExtraction(deps.db, input, parsed.data);
    await logRun(deps, input, { status: applied ? 'applied' : 'stale', output, applied, error: '', ...tokens, latencyMs: Date.now() - started });
    if (applied?.warnings.length) deps.log.warn({ campaignId, turnNumber, warnings: applied.warnings }, 'Extraction applied with warnings');
    return applied;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    deps.log.error({ err, campaignId, turnNumber }, 'Story extraction failed; will retry after a later turn');
    await logRun(deps, input, { status: 'failed', output, applied: null, error: message, ...tokens, latencyMs: Date.now() - started });
    return null;
  }
}

async function logRun(
  deps: ExtractionDeps,
  input: TurnInput,
  run: { status: 'applied' | 'failed' | 'stale'; output: unknown; applied: AppliedExtraction | null; error: string; inputTokens: number; outputTokens: number; latencyMs: number },
) {
  const values = {
    messageId: input.messageId,
    status: run.status,
    model: deps.model,
    output: run.output as never,
    applied: run.applied as never,
    error: run.error,
    inputTokens: run.inputTokens,
    outputTokens: run.outputTokens,
    latencyMs: run.latencyMs,
  };
  await deps.db
    .insert(extractionRuns)
    .values({ campaignId: input.campaign.id, turnNumber: input.turnNumber, attempts: 1, ...values })
    .onConflictDoUpdate({
      target: [extractionRuns.campaignId, extractionRuns.turnNumber],
      // A replayed turn (new narration) starts its attempt count over.
      set: { ...values, attempts: sql`case when ${extractionRuns.messageId} = ${input.messageId} then ${extractionRuns.attempts} + 1 else 1 end`, updatedAt: sql`now()` },
    });
}

/** Extract every due turn of a campaign, oldest first. */
export async function extractDue(deps: ExtractionDeps, campaignId: string): Promise<number> {
  let done = 0;
  for (const turn of await dueTurns(deps.db, campaignId)) {
    if (await extractTurn(deps, campaignId, turn)) done++;
  }
  return done;
}

/** Undo support: forget the runs for a turn being undone, so its replay is extracted afresh. */
export async function forgetRuns(db: Db, campaignId: string, turnNumbers: number[]): Promise<void> {
  if (turnNumbers.length === 0) return;
  await db.delete(extractionRuns).where(and(eq(extractionRuns.campaignId, campaignId), inArray(extractionRuns.turnNumber, turnNumbers)));
}
