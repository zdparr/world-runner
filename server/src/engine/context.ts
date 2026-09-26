import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';
import type Anthropic from '@anthropic-ai/sdk';
import { ATTRIBUTES, type ContextManifest, type ContextSlice, type Ruleset } from '@narrator/shared';
import type { Db } from '../db/client';
import { inventoryItems, locations, loreEntries, messages, missions, npcs, relationships, skills } from '../db/schema';
import { repoRoot } from '../paths';
import type { CampaignRow, CharacterRow } from './game';

const prompt = (name: string) => readFileSync(join(repoRoot, `server/src/engine/prompts/${name}.md`), 'utf8').trim();
const NARRATOR_PROMPT = prompt('narrator');
/** Extra rules for campaigns on a rule set other than classic. */
const RULESET_PROMPTS: Partial<Record<Ruleset, string>> = { ascension: prompt('ascension') };

// ---------------------------------------------------------------- manifest

export interface TurnContext {
  system: Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
  manifest: ContextManifest;
}

export const approxTokens = (text: string) => Math.ceil(text.length / 4);

/**
 * Unsummarized history is sent verbatim until it outgrows this many (approximate) tokens, at which
 * point memory maintenance folds everything but the recent window into the rolling summary.
 */
export const HISTORY_TOKEN_BUDGET = 6_000;
/** Hard cap on verbatim history, in case maintenance falls behind (e.g. utility model down). */
const HISTORY_TOKEN_CAP = 2 * HISTORY_TOKEN_BUDGET;
/** Unsummarized messages read per turn (far more than the cap ever lets through). */
const HISTORY_SCAN_LIMIT = 200;

export function characterHeader(pc: CharacterRow, locationName: string | null): string {
  const parts = [
    pc.name,
    `Lv ${pc.level}${pc.archetype ? ` ${pc.archetype}` : ''}`,
    `HP ${pc.hp}/${pc.maxHp}`,
    `Loc: ${locationName ?? 'unknown'}`,
  ];
  if (pc.statusEffects.length > 0) parts.push(pc.statusEffects.map((s) => s.name).join(', '));
  return parts.join(' — ');
}

// ---------------------------------------------------------------- mention detection (deterministic pre-fetch)

// Words too generic to identify anything on their own.
const STOP_WORDS = new Set(
  (
    'the and with from that this into your have what where when there their them they then than been were will would could should ' +
    'about over under after before other some very just like make take give look around here near back down upward ' +
    'sister brother father mother master mister lord lady captain sir madam ' +
    'hard soft small large little long short old new good great big black white red green blue grey gray dark light ' +
    'roll pack coat bread water wine'
  ).split(/\s+/),
);

function wordsOf(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []);
}

/** Does the message mention this name, in full or by a distinctive word (plurals tolerated)? */
export function mentions(messageWords: Set<string>, messageLower: string, name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (lower.length >= 3 && new RegExp(`(^|[^\\p{L}])${escapeRegex(lower)}($|[^\\p{L}])`, 'u').test(messageLower)) return name;
  for (const token of lower.match(/[\p{L}\p{N}']+/gu) ?? []) {
    if (token.length < 4 || STOP_WORDS.has(token)) continue;
    if (messageWords.has(token) || messageWords.has(`${token}s`) || (token.endsWith('s') && messageWords.has(token.slice(0, -1)))) {
      return token;
    }
  }
  return null;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const LIMITS = { npcs: 3, items: 5, locations: 2, lore: 3 };

// ---------------------------------------------------------------- builder

export async function buildTurnContext(
  db: Db,
  campaign: CampaignRow,
  pc: CharacterRow,
  playerMessage: string,
  turnNumber: number,
): Promise<TurnContext> {
  const cid = campaign.id;
  const core: ContextSlice[] = [];
  const prefetched: ContextSlice[] = [];

  // ---------------------------------------------- static block (cached): prompt + world bible + style
  const rulesetPrompt = RULESET_PROMPTS[campaign.ruleset] ?? '';
  const staticText = [
    NARRATOR_PROMPT,
    rulesetPrompt,
    `# World bible\n\n${campaign.worldBible.trim() || '(No world bible yet. Improvise a coherent setting and keep it consistent.)'}`,
    campaign.narratorStyle.trim() ? `# Narrator style\n\n${campaign.narratorStyle.trim()}` : '',
    `Currency: ${campaign.currencyName}. Amounts are whole units.`,
  ]
    .filter(Boolean)
    .join('\n\n');
  core.push({ slice: 'system_prompt', reason: 'always (cached)', approxTokens: approxTokens(NARRATOR_PROMPT) });
  if (rulesetPrompt) {
    core.push({ slice: 'ruleset_rules', reason: `${campaign.ruleset} rule set (cached)`, approxTokens: approxTokens(rulesetPrompt) });
  }
  core.push({
    slice: 'world_bible_and_style',
    reason: 'always (cached)',
    approxTokens: approxTokens(staticText) - approxTokens(NARRATOR_PROMPT) - approxTokens(rulesetPrompt),
  });

  // ---------------------------------------------- dynamic block: current state
  const [location] = pc.currentLocationId
    ? await db.select().from(locations).where(eq(locations.id, pc.currentLocationId))
    : [];
  const header = characterHeader(pc, location?.name ?? null);

  const [mission] = await db
    .select()
    .from(missions)
    // Daily quests are listed on their own line (ascension rule set).
    .where(and(eq(missions.campaignId, cid), eq(missions.status, 'active'), isNull(missions.recurrence)))
    .orderBy(desc(missions.updatedAt))
    .limit(1);
  const nextObjective = mission?.objectives.find((o) => !o.done);

  // Names and levels only (descriptions via get_skills), so the narrator reuses existing skills
  // instead of inventing near-duplicates ("Swordsmanship" next to "Swordfighting").
  const skillRows = await db
    .select({ name: skills.name, level: skills.level })
    .from(skills)
    .where(eq(skills.campaignId, cid))
    .orderBy(desc(skills.level), asc(skills.name));
  const skillLine = skillRows.length > 0 ? skillRows.map((s) => `${s.name} ${s.level}`).join(', ') : 'none yet';

  const alwaysLore = await db
    .select({ id: loreEntries.id, title: loreEntries.title, body: loreEntries.body })
    .from(loreEntries)
    .where(and(eq(loreEntries.campaignId, cid), eq(loreEntries.alwaysInclude, true)));

  const stateLines = [
    `# Current state (turn ${turnNumber})`,
    `Character: ${header}`,
    `Skills: ${skillLine}`,
    location ? `Location: ${location.name}\n${location.description}` : 'Location: unknown (the character has not been placed anywhere yet)',
    mission
      ? `Active mission: ${mission.title}${nextObjective ? ` (next: ${nextObjective.text})` : ' (all objectives done)'}`
      : 'Active mission: none',
  ];
  if (campaign.ruleset === 'ascension') {
    const attributeLine = `${ATTRIBUTES.map((a) => `${a[0]!.toUpperCase()}${a.slice(1)} ${pc.attributes[a] ?? 0}`).join(', ')} (unspent stat points: ${pc.unspentStatPoints})`;
    const dailies = await db
      .select({ title: missions.title, status: missions.status, objectives: missions.objectives })
      .from(missions)
      .where(and(eq(missions.campaignId, cid), eq(missions.recurrence, 'daily')))
      .orderBy(asc(missions.title));
    const dailyLine =
      dailies.length > 0
        ? dailies
            .map((d) => {
              const next = d.objectives.find((o) => !o.done);
              return `${d.title} (${d.status === 'completed' ? 'done for today' : d.status}${d.status !== 'completed' && next ? `; next: ${next.text}` : ''})`;
            })
            .join('; ')
        : 'none';
    stateLines.splice(3, 0, `Attributes: ${attributeLine}`, `In-game day: ${campaign.gameDay}`, `Daily quests: ${dailyLine}`);
    core.push({ slice: 'attributes', reason: 'ascension rule set', approxTokens: approxTokens(attributeLine), detail: pc.unspentStatPoints });
    core.push({ slice: 'daily_quests', reason: 'ascension rule set', approxTokens: approxTokens(dailyLine), detail: dailies.length });
  }
  core.push({ slice: 'character_header', reason: 'always', approxTokens: approxTokens(header), detail: header });
  core.push({ slice: 'skill_names', reason: 'always (names and levels only)', approxTokens: approxTokens(skillLine), detail: skillRows.length });
  if (location) core.push({ slice: 'location', reason: 'current location', approxTokens: approxTokens(location.description), detail: location.name });
  if (mission) core.push({ slice: 'active_mission', reason: 'title and next objective only', approxTokens: 20, detail: mission.title });

  const summary = campaign.rollingSummary.trim();
  stateLines.push(`# Story so far\n\n${summary || 'This is the beginning of the story. Open with a vivid scene at the character’s location.'}`);
  if (summary) core.push({ slice: 'rolling_summary', reason: 'always', approxTokens: approxTokens(summary) });

  if (alwaysLore.length > 0) {
    stateLines.push(`# Standing lore\n\n${alwaysLore.map((l) => `## ${l.title}\n${l.body}`).join('\n\n')}`);
    for (const l of alwaysLore) core.push({ slice: 'lore', reason: 'always_include', approxTokens: approxTokens(l.body), detail: l.title });
  }

  // ---------------------------------------------- deterministic pre-fetch from the player's message
  const lowerMsg = playerMessage.toLowerCase();
  const msgWords = wordsOf(playerMessage);
  const records: string[] = [];

  const allNpcs = await db.select().from(npcs).where(eq(npcs.campaignId, cid));
  const npcHits = allNpcs
    .map((n) => ({ n, hit: mentions(msgWords, lowerMsg, n.name) }))
    .filter((x) => x.hit)
    .slice(0, LIMITS.npcs);
  if (npcHits.length > 0) {
    const rels = await db.select().from(relationships).where(inArray(relationships.npcId, npcHits.map((x) => x.n.id)));
    const locNames = new Map(
      (await db.select({ id: locations.id, name: locations.name }).from(locations).where(eq(locations.campaignId, cid))).map((l) => [l.id, l.name]),
    );
    for (const { n, hit } of npcHits) {
      const rel = rels.find((r) => r.npcId === n.id);
      const npcRecord = {
        name: n.name,
        shortDescription: n.shortDescription,
        faction: n.faction,
        location: n.locationId ? (locNames.get(n.locationId) ?? null) : null,
        alive: n.alive,
        gmNotes: n.notes,
      };
      const relRecord = rel
        ? { affinity: rel.affinity, trust: rel.trust, status: rel.status, historyNotes: rel.historyNotes }
        : { affinity: 0, trust: 0, status: 'stranger', historyNotes: '' };
      const text = `## NPC: ${n.name}\n${JSON.stringify(npcRecord)}\nRelationship with the player character: ${JSON.stringify(relRecord)}`;
      records.push(text);
      prefetched.push({ slice: 'npc', reason: `mentioned ("${hit}")`, approxTokens: approxTokens(JSON.stringify(npcRecord)), detail: n.name });
      prefetched.push({ slice: 'relationship', reason: `NPC mentioned ("${hit}")`, approxTokens: approxTokens(JSON.stringify(relRecord)), detail: n.name });
    }
  }

  const items = await db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, cid));
  const itemHits = items
    .map((i) => ({ i, hit: mentions(msgWords, lowerMsg, i.name) }))
    .filter((x) => x.hit)
    .slice(0, LIMITS.items);
  if (itemHits.length > 0) {
    const view = itemHits.map(({ i }) => ({ name: i.name, quantity: i.quantity, description: i.description, tags: i.tags, equipped: i.equipped }));
    records.push(`## Mentioned items the character carries (not the full inventory)\n${JSON.stringify(view)}`);
    for (const { i, hit } of itemHits) prefetched.push({ slice: 'item', reason: `mentioned ("${hit}")`, approxTokens: approxTokens(JSON.stringify(i.name + i.description)), detail: i.name });
  }

  const allLocations = await db.select().from(locations).where(eq(locations.campaignId, cid));
  const locHits = allLocations
    .filter((l) => l.id !== location?.id)
    .map((l) => ({ l, hit: mentions(msgWords, lowerMsg, l.name) }))
    .filter((x) => x.hit)
    .slice(0, LIMITS.locations);
  for (const { l, hit } of locHits) {
    records.push(`## Location: ${l.name}\n${l.description}`);
    prefetched.push({ slice: 'location', reason: `mentioned ("${hit}")`, approxTokens: approxTokens(l.description), detail: l.name });
  }

  const lore = await db.select().from(loreEntries).where(and(eq(loreEntries.campaignId, cid), eq(loreEntries.alwaysInclude, false)));
  const loreHits = lore
    .map((l) => ({ l, hit: [l.title, ...l.keywords].map((k) => mentions(msgWords, lowerMsg, k)).find(Boolean) }))
    .filter((x) => x.hit)
    .slice(0, LIMITS.lore);
  for (const { l, hit } of loreHits) {
    records.push(`## Lore: ${l.title}\n${l.body}`);
    prefetched.push({ slice: 'lore', reason: `keyword ("${hit}")`, approxTokens: approxTokens(l.body), detail: l.title });
  }

  if (records.length > 0) {
    stateLines.push(
      `# Fetched for this turn\n\nThese records matched words in the player's message. They are current; no need to look them up again this turn.\n\n${records.join('\n\n')}`,
    );
  }

  // ---------------------------------------------- recent history
  // Every message not yet folded into the summary, newest first: always the recent window, then older
  // ones while they fit under the cap. Maintenance folds all but the window every few turns.
  const unsummarized = await db
    .select({ role: messages.role, content: messages.content, turnNumber: messages.turnNumber })
    .from(messages)
    .where(and(eq(messages.campaignId, cid), eq(messages.summarized, false)))
    .orderBy(desc(messages.id))
    .limit(HISTORY_SCAN_LIMIT);
  let historyTokens = 0;
  let take = 0;
  for (const m of unsummarized) {
    const cost = approxTokens(m.content);
    if (take >= campaign.historyWindow && historyTokens + cost > HISTORY_TOKEN_CAP) break;
    historyTokens += cost;
    take++;
  }
  const recent = unsummarized.slice(0, take).reverse();
  const overCap = unsummarized.length - take;
  // The conversation must open with a user turn.
  while (recent[0]?.role === 'narrator') recent.shift();
  const history: Anthropic.MessageParam[] = recent.map((m) => ({
    role: m.role === 'player' ? 'user' : 'assistant',
    content: m.content,
  }));
  const turns = [...new Set(recent.map((m) => m.turnNumber))];
  core.push({
    slice: 'recent_messages',
    reason:
      recent.length <= campaign.historyWindow
        ? `last ${campaign.historyWindow} unsummarized messages`
        : `all ${recent.length} unsummarized messages (window ${campaign.historyWindow}; older ones are folded into the summary every ${campaign.summaryInterval} turns)`,
    approxTokens: approxTokens(recent.map((m) => m.content).join('')),
    detail: { count: recent.length, turns: turns.length > 0 ? `${turns[0]}–${turns[turns.length - 1]}` : 'none' },
  });

  const dynamicText = stateLines.join('\n\n');
  const prefetchedNpcs = new Set(prefetched.filter((p) => p.slice === 'npc').map((p) => p.detail));
  const notIncluded = [
    itemHits.length > 0 ? 'rest of inventory' : 'inventory',
    'money',
    'skill descriptions and XP',
    prefetchedNpcs.size > 0 ? 'other relationships' : 'relationships',
    prefetchedNpcs.size > 0 ? 'other NPCs' : 'NPCs',
    'missions other than the active one',
    loreHits.length > 0 ? 'other lore' : 'lore',
    'older history (summarized; searchable with search_past_events)',
    ...(overCap > 0 ? [`${overCap} older unsummarized messages (over the history cap)`] : []),
  ];

  return {
    system: [
      { type: 'text', text: staticText, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: dynamicText },
    ],
    messages: [...history, { role: 'user', content: playerMessage }],
    manifest: { core, prefetched, notIncluded },
  };
}
