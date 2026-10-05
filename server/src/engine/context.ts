import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type Anthropic from '@anthropic-ai/sdk';
import { ATTRIBUTES, MIN_WORLD_LOCATIONS, levelBonus, skillTier, type ContextManifest, type ContextSlice, type NarrationLength, type Ruleset } from '@narrator/shared';
import type { Db } from '../db/client';
import { inventoryItems, locations, loreEntries, messages, missions, npcs, relationships, skills, stateEvents } from '../db/schema';
import { repoRoot } from '../paths';
import { describeGear, describeRoutine, type CampaignRow, type CharacterRow } from './game';
import { MANUAL_EDIT_EVENT } from './manual';

const prompt = (name: string) => readFileSync(join(repoRoot, `server/src/engine/prompts/${name}.md`), 'utf8').trim();
const NARRATOR_PROMPT = prompt('narrator');
/** Extra rules for campaigns on a rule set other than classic. */
const RULESET_PROMPTS: Partial<Record<Ruleset, string>> = { ascension: prompt('ascension') };

/** Per-campaign length setting, restated every turn so it outweighs the habits of the transcript. */
const NARRATION_LENGTH: Record<NarrationLength, string> = {
  brief: 'Brief: usually one to three short paragraphs. Keep it tight and fast, but never skip a consequence or an NPC reaction that matters.',
  standard:
    'Standard: usually three to five paragraphs for a scene, one or two for a quick exchange. Give arrivals, fights, and revelations room.',
  rich: 'Rich: usually five to eight full paragraphs. Linger on sensory detail, NPC body language and subtext, the texture of the world, and the character’s surroundings shifting in response to what they did. Quick exchanges can still be shorter.',
};

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
    `Lv ${pc.level}${pc.archetype ? ` ${pc.archetype}` : ''}${levelBonus(pc.level) > 0 ? ` (+${levelBonus(pc.level)} to all checks)` : ''}`,
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

/** The last turn on which anything changed this NPC's record (null if nothing has since it was seeded). */
async function lastNpcWrite(db: Db, campaignId: string, npcId: string): Promise<number | null> {
  const [row] = await db
    .select({ turn: sql<number | null>`max(${stateEvents.turnNumber})` })
    .from(stateEvents)
    .where(
      and(
        eq(stateEvents.campaignId, campaignId),
        sql`${stateEvents.payload}->'changes' @> ${JSON.stringify([{ table: 'npcs', key: { id: npcId } }])}::jsonb`,
      ),
    );
  return row?.turn ?? null;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const LIMITS = { npcs: 3, items: 5, locations: 2, lore: 3 };
/** Extra NPCs fetched because the last narration named them (the scene's cast), after the player's own mentions. */
const NARRATION_NPC_LIMIT = 3;
/** An NPC record untouched for this many turns is flagged so the narrator refreshes it. */
const STALE_NPC_TURNS = 50;
/** Location names listed every turn; bigger worlds are summarized with a count. */
const MAX_PLACES_LISTED = 40;

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
  // Tiers let the narration show competence: a Journeyman handles what a Novice fumbles.
  const skillLine = skillRows.length > 0 ? skillRows.map((s) => `${s.name} ${s.level} (${skillTier(s.level)})`).join(', ') : 'none yet';

  // Every place in the world, by name, so the narrator can use (and route the story through) them.
  const worldLocations = await db
    .select({ id: locations.id, name: locations.name, purpose: locations.purpose })
    .from(locations)
    .where(eq(locations.campaignId, cid))
    .orderBy(asc(locations.createdAt), asc(locations.name));
  const shownPlaces = worldLocations.slice(0, MAX_PLACES_LISTED);
  const placesLine = [
    `Places in this world (${worldLocations.length}): ${shownPlaces.length > 0 ? shownPlaces.map((l) => l.name).join('; ') : 'none yet'}${worldLocations.length > shownPlaces.length ? `; and ${worldLocations.length - shownPlaces.length} more` : ''}. Use get_location for any of them.`,
    worldLocations.length < MIN_WORLD_LOCATIONS
      ? `The world needs at least ${MIN_WORLD_LOCATIONS} locations, and has ${worldLocations.length}. This turn, call create_location for the ${MIN_WORLD_LOCATIONS - worldLocations.length} missing ones, grounded in the world bible and story so far, each with a purpose that ties it to a mission, a thread, an NPC, or a secret. They need not be visited yet.`
      : '',
    (() => {
      const missing = worldLocations.filter((l) => !l.purpose.trim()).map((l) => l.name);
      return missing.length > 0
        ? `Places with no purpose yet: ${missing.join('; ')}. Give each one a purpose with update_location, starting with any the story touches this turn.`
        : '';
    })(),
  ]
    .filter(Boolean)
    .join('\n');

  // Graded gear changes rolls, so the narrator always knows what's equipped and what it's good for.
  const gearLine = (
    await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.campaignId, cid), eq(inventoryItems.equipped, true)))
      .orderBy(desc(inventoryItems.grade), asc(inventoryItems.name))
  )
    .map(describeGear)
    .filter(Boolean)
    .join('; ');

  const alwaysLore = await db
    .select({ id: loreEntries.id, title: loreEntries.title, body: loreEntries.body })
    .from(loreEntries)
    .where(and(eq(loreEntries.campaignId, cid), eq(loreEntries.alwaysInclude, true)));

  const stateLines = [
    `# Current state (turn ${turnNumber})`,
    `Character: ${header}`,
    `Skills: ${skillLine}`,
    ...(gearLine ? [`Equipped gear with check bonuses (pass the weapon or tool in use as skill_check \`using\`; worn gear counts on its own): ${gearLine}`] : []),
    ...(pc.routines.length > 0
      ? [`Nightly routines (trained automatically every night and during time skips; never grant their XP by hand): ${pc.routines.map(describeRoutine).join('; ')}`]
      : []),
    location
      ? `Location: ${location.name}\n${location.description}\nPurpose (GM-only, don't reveal it directly): ${location.purpose.trim() || 'none yet; give it one with update_location'}`
      : 'Location: unknown (the character has not been placed anywhere yet)',
    placesLine,
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
              // Objective ids, so ticking one with update_mission needs no lookup.
              const left = d.objectives.filter((o) => !o.done).map((o) => `${o.id} "${o.text}"`);
              return `${d.title} (${d.status === 'completed' ? 'done for today' : d.status}${d.status !== 'completed' && left.length > 0 ? `; to do: ${left.join(', ')}` : ''})`;
            })
            .join('; ')
        : 'none';
    stateLines.splice(3, 0, `Attributes: ${attributeLine}`, `In-game day: ${campaign.gameDay}`, `Daily quests: ${dailyLine}`);
    core.push({ slice: 'attributes', reason: 'ascension rule set', approxTokens: approxTokens(attributeLine), detail: pc.unspentStatPoints });
    core.push({ slice: 'daily_quests', reason: 'ascension rule set', approxTokens: approxTokens(dailyLine), detail: dailies.length });
  }
  core.push({ slice: 'character_header', reason: 'always', approxTokens: approxTokens(header), detail: header });
  core.push({ slice: 'skill_names', reason: 'always (names and levels only)', approxTokens: approxTokens(skillLine), detail: skillRows.length });
  if (location) core.push({ slice: 'location', reason: 'current location (with purpose)', approxTokens: approxTokens(location.description + location.purpose), detail: location.name });
  core.push({ slice: 'places', reason: 'always (names only)', approxTokens: approxTokens(placesLine), detail: worldLocations.length });
  if (mission) core.push({ slice: 'active_mission', reason: 'title and next objective only', approxTokens: 20, detail: mission.title });

  stateLines.push(`Narration length: ${NARRATION_LENGTH[campaign.narrationLength]}`);
  core.push({ slice: 'narration_length', reason: 'campaign setting', approxTokens: 30, detail: campaign.narrationLength });

  const storyNotes = campaign.storyNotes.trim();
  stateLines.push(
    `# Your story notes (private; the player never sees these)\n\n${storyNotes || 'None yet. Once the story finds its footing, use update_story_notes to plan threads, secrets, and what NPCs are doing offscreen.'}`,
  );
  if (storyNotes) core.push({ slice: 'story_notes', reason: 'always (GM planning)', approxTokens: approxTokens(storyNotes) });

  // Fixes the player made by hand since the last turn (they're logged on that turn).
  const corrections = await db
    .select({ text: stateEvents.humanReadable })
    .from(stateEvents)
    .where(and(eq(stateEvents.campaignId, cid), eq(stateEvents.turnNumber, turnNumber - 1), eq(stateEvents.eventType, MANUAL_EDIT_EVENT)))
    .orderBy(asc(stateEvents.id));
  if (corrections.length > 0) {
    const text = corrections.map((c) => `- ${c.text}`).join('\n');
    stateLines.push(
      `# Player corrections since your last turn\n\nThe player fixed these by hand. They are already applied: treat them as true, don't grant or change them again, and remember what you missed.\n${text}`,
    );
    core.push({ slice: 'corrections', reason: 'edited by hand since the last turn', approxTokens: approxTokens(text), detail: corrections.length });
  }

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
  const playerNpcHits = allNpcs
    .map((n) => ({ n, hit: mentions(msgWords, lowerMsg, n.name), source: 'mentioned' }))
    .filter((x) => x.hit)
    .slice(0, LIMITS.npcs);
  // The people in the scene are whoever the narrator just wrote about, named by the player or not.
  const [lastNarration] = await db
    .select({ content: messages.content })
    .from(messages)
    .where(and(eq(messages.campaignId, cid), eq(messages.role, 'narrator')))
    .orderBy(desc(messages.id))
    .limit(1);
  const narrationLower = lastNarration?.content.toLowerCase() ?? '';
  const narrationWords = wordsOf(narrationLower);
  const narrationNpcHits = allNpcs
    .filter((n) => !playerNpcHits.some((p) => p.n.id === n.id))
    .map((n) => ({ n, hit: narrationLower ? mentions(narrationWords, narrationLower, n.name) : null, source: 'named in the last narration' }))
    .filter((x) => x.hit)
    // Latest mention first: the end of the narration is where the scene stands now.
    .sort((a, b) => narrationLower.lastIndexOf(b.hit!.toLowerCase()) - narrationLower.lastIndexOf(a.hit!.toLowerCase()))
    .slice(0, NARRATION_NPC_LIMIT);
  const npcHits = [...playerNpcHits, ...narrationNpcHits];
  if (npcHits.length > 0) {
    const rels = await db.select().from(relationships).where(inArray(relationships.npcId, npcHits.map((x) => x.n.id)));
    const locNames = new Map(
      (await db.select({ id: locations.id, name: locations.name }).from(locations).where(eq(locations.campaignId, cid))).map((l) => [l.id, l.name]),
    );
    for (const { n, hit, source } of npcHits) {
      const rel = rels.find((r) => r.npcId === n.id);
      const lastWritten = await lastNpcWrite(db, cid, n.id);
      const age = turnNumber - (lastWritten ?? 0);
      const npcRecord = {
        name: n.name,
        shortDescription: n.shortDescription,
        faction: n.faction,
        location: n.locationId ? (locNames.get(n.locationId) ?? null) : null,
        alive: n.alive,
        gmNotes: n.notes,
        recordLastUpdated: lastWritten ? `turn ${lastWritten}` : 'never, since the campaign began',
        ...(age >= STALE_NPC_TURNS
          ? {
              stale: `Not updated in ${age} turns. If their situation, whereabouts, or attitude has moved on, fix it with update_npc this turn. Don't replay a past scene's mood or plans as if they were current.`,
            }
          : {}),
      };
      const relRecord = rel
        ? { affinity: rel.affinity, trust: rel.trust, status: rel.status, historyNotes: rel.historyNotes }
        : { affinity: 0, trust: 0, status: 'stranger', historyNotes: '' };
      const text = `## NPC: ${n.name}\n${JSON.stringify(npcRecord)}\nRelationship with the player character: ${JSON.stringify(relRecord)}`;
      records.push(text);
      prefetched.push({ slice: 'npc', reason: `${source} ("${hit}")`, approxTokens: approxTokens(JSON.stringify(npcRecord)), detail: n.name });
      prefetched.push({ slice: 'relationship', reason: `NPC ${source} ("${hit}")`, approxTokens: approxTokens(JSON.stringify(relRecord)), detail: n.name });
    }
  }

  const items = await db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, cid));
  const itemHits = items
    .map((i) => ({ i, hit: mentions(msgWords, lowerMsg, i.name) }))
    .filter((x) => x.hit)
    .slice(0, LIMITS.items);
  if (itemHits.length > 0) {
    const view = itemHits.map(({ i }) => ({
      name: i.name,
      quantity: i.quantity,
      description: i.description,
      tags: i.tags,
      equipped: i.equipped,
      ...(describeGear(i) ? { bonus: describeGear(i) } : {}),
    }));
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
    records.push(`## Location: ${l.name}\n${l.description}${l.purpose.trim() ? `\nPurpose (GM-only): ${l.purpose}` : ''}`);
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
      `# Fetched for this turn\n\nThese records matched words in the player's message or your last narration. They are current; no need to look them up again this turn.\n\n${records.join('\n\n')}`,
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
