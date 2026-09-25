import { and, asc, desc, eq, getTableColumns, lt, sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  CampaignCreate,
  CampaignUpdate,
  CharacterUpdate,
  CharacterUpsert,
  ItemCreate,
  ItemUpdate,
  LocationCreate,
  LocationUpdate,
  LoreCreate,
  LoreUpdate,
  MissionCreate,
  MissionUpdate,
  NpcCreate,
  NpcUpdate,
  RelationshipCreate,
  RelationshipUpdate,
  SkillCreate,
  SkillUpdate,
  type MissionObjectiveInput,
  type Page,
} from '@narrator/shared';
import {
  campaigns,
  inventoryItems,
  locations,
  loreEntries,
  messages,
  missions,
  npcs,
  playerCharacter,
  relationships,
  skills,
  stateEvents,
  turnDebug,
} from '../db/schema';
import { assertNoLocationCycle, assertRefsInCampaign } from '../db/refs';
import { normalizeObjectives } from '../game/missions';
import { badRequest, notFound, parseId, parseWith } from '../http/errors';
import { registerCollection } from './crud';

declare module 'fastify' {
  interface FastifyRequest {
    /** Set (and verified to exist) for every route under /api/campaigns/:campaignId. */
    campaignId: string;
  }
}

const { searchVector: _m, ...messageColumns } = getTableColumns(messages);
const { searchVector: _e, ...eventColumns } = getTableColumns(stateEvents);

const PageQuery = z.object({
  before: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const campaignRoutes: FastifyPluginAsync = async (app) => {
  const { db } = app;

  // ------------------------------------------------------------ campaigns

  app.get('/', async () => {
    return db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        turnCount: campaigns.turnCount,
        characterName: playerCharacter.name,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
      })
      .from(campaigns)
      .leftJoin(playerCharacter, eq(playerCharacter.campaignId, campaigns.id))
      .orderBy(desc(campaigns.updatedAt));
  });

  app.post('/', async (request, reply) => {
    const data = parseWith(CampaignCreate, request.body);
    const [row] = await db.insert(campaigns).values(data).returning();
    return reply.code(201).send(row);
  });

  // ------------------------------------------------------------ everything scoped to one campaign

  await app.register(async (scope) => {
    scope.decorateRequest('campaignId', '');
    scope.addHook('preHandler', async (request) => {
      const id = parseId((request.params as { campaignId?: string }).campaignId, 'Campaign');
      const [row] = await db.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.id, id)).limit(1);
      if (!row) throw notFound('Campaign');
      request.campaignId = id;
    });

    await scope.register(
      async (c) => {
        c.get('/', async (request) => {
          const [row] = await db.select().from(campaigns).where(eq(campaigns.id, request.campaignId));
          return row;
        });

        c.patch('/', async (request) => {
          const data = parseWith(CampaignUpdate, request.body);
          const [row] = await db.update(campaigns).set(data).where(eq(campaigns.id, request.campaignId)).returning();
          return row;
        });

        c.delete('/', async (request, reply) => {
          await db.delete(campaigns).where(eq(campaigns.id, request.campaignId));
          return reply.code(204).send();
        });

        // ---------------------------------------------------- player character (one per campaign)

        c.get('/character', async (request) => {
          const [row] = await db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, request.campaignId));
          if (!row) throw notFound('Character');
          return row;
        });

        c.put('/character', async (request) => {
          const { campaignId } = request;
          const data = parseWith(CharacterUpsert, request.body);
          await assertRefsInCampaign(db, campaignId, data);
          const [row] = await db
            .insert(playerCharacter)
            .values({ ...data, campaignId })
            .onConflictDoUpdate({ target: playerCharacter.campaignId, set: data })
            .returning();
          return row;
        });

        c.patch('/character', async (request) => {
          const { campaignId } = request;
          const data = parseWith(CharacterUpdate, request.body);
          await assertRefsInCampaign(db, campaignId, data);
          const [row] = await db
            .update(playerCharacter)
            .set(data)
            .where(eq(playerCharacter.campaignId, campaignId))
            .returning();
          if (!row) throw notFound('Character');
          return row;
        });

        // ---------------------------------------------------- world and state collections

        registerCollection(c, {
          path: 'skills',
          label: 'Skill',
          table: skills,
          create: SkillCreate,
          update: SkillUpdate,
          orderBy: [desc(skills.level), asc(skills.name)],
        });

        registerCollection(c, {
          path: 'items',
          label: 'Item',
          table: inventoryItems,
          create: ItemCreate,
          update: ItemUpdate,
          orderBy: [desc(inventoryItems.equipped), asc(inventoryItems.name)],
        });

        registerCollection(c, {
          path: 'locations',
          label: 'Location',
          table: locations,
          create: LocationCreate,
          update: LocationUpdate,
          orderBy: [asc(locations.name)],
          validate: async ({ db, id, data }) => {
            if (id && data.parentLocationId !== undefined) {
              await assertNoLocationCycle(db, id, data.parentLocationId as string | null);
            }
          },
        });

        registerCollection(c, {
          path: 'npcs',
          label: 'NPC',
          table: npcs,
          create: NpcCreate,
          update: NpcUpdate,
          orderBy: [asc(npcs.name)],
        });

        registerCollection(c, {
          path: 'relationships',
          label: 'Relationship',
          table: relationships,
          create: RelationshipCreate,
          update: RelationshipUpdate,
          orderBy: [desc(relationships.updatedAt)],
        });

        registerCollection(c, {
          path: 'lore',
          label: 'Lore entry',
          table: loreEntries,
          create: LoreCreate,
          update: LoreUpdate,
          orderBy: [desc(loreEntries.alwaysInclude), asc(loreEntries.title)],
          hidden: ['searchVector'],
        });

        registerCollection(c, {
          path: 'missions',
          label: 'Mission',
          table: missions,
          create: MissionCreate,
          update: MissionUpdate,
          // Order by lifecycle: active first, then offered, then finished.
          orderBy: [
            sql`array_position(array['active','offered','completed','failed']::mission_status[], ${missions.status})`,
            desc(missions.updatedAt),
          ],
          prepare: (data) =>
            data.objectives
              ? { ...data, objectives: normalizeObjectives(data.objectives as MissionObjectiveInput[]) }
              : data,
        });

        // ---------------------------------------------------- history (read-only; written by the turn engine)

        c.get('/messages', async (request): Promise<Page<unknown>> => {
          const { before, limit } = parseWith(PageQuery, request.query);
          const rows = await db
            .select(messageColumns)
            .from(messages)
            .where(and(eq(messages.campaignId, request.campaignId), before ? lt(messages.id, before) : undefined))
            .orderBy(desc(messages.id))
            .limit(limit + 1);
          return pageOf(rows, limit);
        });

        c.get('/events', async (request): Promise<Page<unknown>> => {
          const { before, limit } = parseWith(PageQuery, request.query);
          const rows = await db
            .select(eventColumns)
            .from(stateEvents)
            .where(and(eq(stateEvents.campaignId, request.campaignId), before ? lt(stateEvents.id, before) : undefined))
            .orderBy(desc(stateEvents.id))
            .limit(limit + 1);
          return pageOf(rows, limit);
        });

        c.get<{ Params: { turn: string } }>('/turns/:turn/debug', async (request) => {
          const turn = Number(request.params.turn);
          if (!Number.isSafeInteger(turn) || turn < 1) throw badRequest('turn must be a positive integer');
          const [row] = await db
            .select()
            .from(turnDebug)
            .where(and(eq(turnDebug.campaignId, request.campaignId), eq(turnDebug.turnNumber, turn)));
          if (!row) throw notFound('Turn debug record');
          return row;
        });
      },
      { prefix: '/:campaignId' },
    );
  });
};

/** Rows arrive newest-first with one extra row as a lookahead; return them oldest-first. */
function pageOf<T extends { id: number }>(rows: T[], limit: number): Page<T> {
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).reverse();
  const oldest = items[0];
  return { items, nextBefore: hasMore && oldest ? oldest.id : null };
}
