import { and, eq, sql } from 'drizzle-orm';
import {
  HP_PER_LEVEL,
  MAX_CHARACTER_LEVEL,
  MAX_SKILL_LEVEL,
  RELATIONSHIP_MAX,
  RELATIONSHIP_MIN,
  characterXpToNext,
  skillXpToNext,
  type StateChange,
} from '@narrator/shared';
import type { Db } from '../db/client';
import { campaigns, inventoryItems, npcs, playerCharacter, relationships, skills } from '../db/schema';
import { ToolError, findByName, findOptional } from './lookup';
import type { Mutator, RecordedEvent } from './mutator';

export type CampaignRow = typeof campaigns.$inferSelect;
export type CharacterRow = typeof playerCharacter.$inferSelect;
export type SkillRow = typeof skills.$inferSelect;
export type ItemRow = typeof inventoryItems.$inferSelect;
export type NpcRow = typeof npcs.$inferSelect;
export type RelationshipRow = typeof relationships.$inferSelect;

/** Everything a tool needs for one turn. Lives for the duration of the turn's transaction. */
export interface EngineContext {
  db: Db;
  campaign: CampaignRow;
  turnNumber: number;
  mutator: Mutator;
  /** Index of the next dice roll this turn (seeds it). Shared across tool calls. */
  nextRollIndex(): number;
  /** Commit pending row changes as a state event and announce it to the client. */
  record(event: RecordedEvent): Promise<StateChange | null>;
}

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export async function getCharacter(ctx: EngineContext): Promise<CharacterRow> {
  const [row] = await ctx.db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, ctx.campaign.id));
  if (!row) throw new ToolError('This campaign has no player character.');
  return row;
}

export function findNpc(ctx: EngineContext, name: string) {
  return findByName<NpcRow>(ctx.db, { table: npcs, nameColumn: npcs.name, campaignId: ctx.campaign.id, query: name, label: 'NPC' });
}

export function findSkill(ctx: EngineContext, name: string) {
  return findOptional<SkillRow>(ctx.db, { table: skills, nameColumn: skills.name, campaignId: ctx.campaign.id, query: name, label: 'skill' });
}

export function findItem(ctx: EngineContext, name: string) {
  return findByName<ItemRow>(ctx.db, {
    table: inventoryItems,
    nameColumn: inventoryItems.name,
    campaignId: ctx.campaign.id,
    query: name,
    label: 'item in the inventory',
  });
}

// ---------------------------------------------------------------- money

export async function applyMoney(ctx: EngineContext, delta: number, reason: string) {
  const pc = await getCharacter(ctx);
  const currency = ctx.campaign.currencyName;
  const balance = pc.money + delta;
  if (balance < 0) {
    throw new ToolError(`Not enough money: the character has ${pc.money} ${currency} and this needs ${-delta}. Nothing was spent.`);
  }
  await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { money: balance });
  await ctx.record({
    eventType: 'money',
    humanReadable: `${signed(delta)} ${currency}${reason ? ` (${reason})` : ''}`,
    details: { delta, balance, currency },
  });
  return { delta, balance, currency };
}

// ---------------------------------------------------------------- xp and levels

/** Apply xp to a (level, progress) pair, rolling over as many level-ups as it pays for. */
export function addXp(level: number, xp: number, amount: number, toNext: (level: number) => number, maxLevel: number) {
  let lvl = level;
  let progress = xp + amount;
  while (lvl < maxLevel && progress >= toNext(lvl)) {
    progress -= toNext(lvl);
    lvl++;
  }
  if (lvl >= maxLevel) progress = Math.min(progress, toNext(lvl) - 1);
  return { level: lvl, xp: progress };
}

export async function applyCharacterXp(ctx: EngineContext, amount: number, reason: string) {
  const pc = await getCharacter(ctx);
  const next = addXp(pc.level, pc.xp, amount, characterXpToNext, MAX_CHARACTER_LEVEL);
  const levelsGained = next.level - pc.level;
  const hpGain = levelsGained * HP_PER_LEVEL;
  await ctx.mutator.update(
    'player_character',
    { campaignId: ctx.campaign.id },
    { level: next.level, xp: next.xp, maxHp: pc.maxHp + hpGain, hp: pc.hp + hpGain },
  );
  await ctx.record({
    eventType: levelsGained > 0 ? 'level_up' : 'xp',
    humanReadable:
      levelsGained > 0
        ? `Level ${pc.level} → ${next.level} (+${amount} xp${reason ? `, ${reason}` : ''})`
        : `+${amount} xp${reason ? ` (${reason})` : ''}`,
    details: { amount, level: next.level, xp: next.xp, xpToNext: characterXpToNext(next.level), levelsGained },
  });
  return { level: next.level, xp: next.xp, xpToNext: characterXpToNext(next.level), levelsGained, maxHp: pc.maxHp + hpGain };
}

export async function applySkillXp(ctx: EngineContext, skillName: string, amount: number, reason: string) {
  let skill = await findSkill(ctx, skillName);
  let created = false;
  if (!skill) {
    // Learning something new: the skill starts at level 0.
    skill = await ctx.mutator.insert<SkillRow>('skills', { name: skillName.trim(), level: 0, xp: 0 });
    created = true;
  }
  const next = addXp(skill.level, skill.xp, amount, skillXpToNext, MAX_SKILL_LEVEL);
  await ctx.mutator.update('skills', { id: skill.id }, { level: next.level, xp: next.xp });
  const leveled = next.level > skill.level;
  await ctx.record({
    eventType: leveled ? 'skill_level' : 'skill_xp',
    humanReadable: leveled
      ? `${skill.name} ${skill.level} → ${next.level}`
      : `${skill.name} +${amount} xp${created ? ' (new skill)' : ''}${reason ? ` (${reason})` : ''}`,
    details: { skill: skill.name, amount, levelBefore: skill.level, level: next.level, xp: next.xp, xpToNext: skillXpToNext(next.level), created },
  });
  return { skill: skill.name, level: next.level, levelBefore: skill.level, xp: next.xp, xpToNext: skillXpToNext(next.level), created };
}

// ---------------------------------------------------------------- items

export async function addItem(
  ctx: EngineContext,
  item: { name: string; quantity: number; description?: string; tags?: string[] },
  reason = '',
) {
  const name = item.name.trim();
  // Stack on the exact name (case-insensitive) only; a near match might be a different item.
  const [stack] = await ctx.db
    .select()
    .from(inventoryItems)
    .where(and(eq(inventoryItems.campaignId, ctx.campaign.id), sql`lower(${inventoryItems.name}) = lower(${name})`));
  let total: number;
  if (stack) {
    total = stack.quantity + item.quantity;
    await ctx.mutator.update('inventory_items', { id: stack.id }, {
      quantity: total,
      ...(!stack.description && item.description ? { description: item.description } : {}),
    });
  } else {
    total = item.quantity;
    await ctx.mutator.insert('inventory_items', {
      name,
      quantity: item.quantity,
      description: item.description ?? '',
      tags: (item.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    });
  }
  const label = stack?.name ?? name;
  await ctx.record({
    eventType: 'item_added',
    humanReadable: `+${item.quantity} ${label}${reason ? ` (${reason})` : ''}`,
    details: { item: label, quantity: item.quantity, total },
  });
  return { item: label, added: item.quantity, total };
}

// ---------------------------------------------------------------- relationships

export async function applyRelationship(
  ctx: EngineContext,
  npcName: string,
  affinityDelta: number,
  trustDelta: number,
  note: string,
  status?: string,
) {
  const npc = await findNpc(ctx, npcName);
  const [rel] = await ctx.db.select().from(relationships).where(eq(relationships.npcId, npc.id));
  const before = rel ?? { affinity: 0, trust: 0, status: 'stranger', historyNotes: '', notesSinceCondense: 0 };
  const affinity = clamp(before.affinity + affinityDelta, RELATIONSHIP_MIN, RELATIONSHIP_MAX);
  const trust = clamp(before.trust + trustDelta, RELATIONSHIP_MIN, RELATIONSHIP_MAX);
  const line = note.trim() ? `- (turn ${ctx.turnNumber}) ${note.trim()}` : '';
  const patch = {
    affinity,
    trust,
    status: status?.trim() || before.status,
    historyNotes: line ? [before.historyNotes, line].filter(Boolean).join('\n') : before.historyNotes,
    notesSinceCondense: before.notesSinceCondense + (line ? 1 : 0),
  };
  if (rel) await ctx.mutator.update('relationships', { id: rel.id }, patch);
  else await ctx.mutator.insert('relationships', { npcId: npc.id, ...patch });

  const applied = { affinity: affinity - before.affinity, trust: trust - before.trust };
  const parts = [
    applied.trust ? `trust ${signed(applied.trust)}` : '',
    applied.affinity ? `affinity ${signed(applied.affinity)}` : '',
    patch.status !== before.status ? `now "${patch.status}"` : '',
  ].filter(Boolean);
  await ctx.record({
    eventType: 'relationship',
    humanReadable: `${npc.name}: ${parts.join(', ') || 'noted'}`,
    details: { npc: npc.name, affinityDelta: applied.affinity, trustDelta: applied.trust, affinity, trust, status: patch.status },
  });
  return {
    npc: npc.name,
    affinity,
    trust,
    status: patch.status,
    ...(applied.affinity !== affinityDelta || applied.trust !== trustDelta ? { note: 'Clamped to the -100..100 range.' } : {}),
  };
}
