import { and, asc, desc, eq, getTableColumns, inArray, lt, sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  CampaignCreate,
  CampaignUpdate,
  CampaignFromTemplate,
  HIGHLIGHT_EVENT_TYPES,
  type CampaignTemplate,
  type TurnHighlight,
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
import { assertNoLocationCycle } from '../db/refs';
import { TEMPLATES, createFromTemplate, findTemplate } from '../db/seed/templates';
import { withManualEdit } from '../engine/manual';
import { normalizeObjectives } from '../game/missions';
import { badRequest, notFound, parseId, parseWith } from '../http/errors';
import { registerCharacterRoutes } from './character';
import { registerCollection } from './crud';
import { registerStateRoutes } from './state';
import { registerTurnRoutes } from './turns';

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

  app.get('/templates', async (): Promise<CampaignTemplate[]> =>
    TEMPLATES.map(({ id, name, description }) => ({ id, name, description })),
  );

  app.post('/from-template', async (request, reply) => {
    const { templateId, name, includeCharacter } = parseWith(CampaignFromTemplate, request.body);
    if (!findTemplate(templateId)) throw notFound('Template');
    const id = await createFromTemplate(db, templateId, { name, includeCharacter });
    const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id));
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
          const { campaignId } = request;
          if (Object.keys(data).length === 0) return (await db.select().from(campaigns).where(eq(campaigns.id, campaignId)))[0];
          return withManualEdit(db, campaignId, (mutator) => mutator.update('campaigns', { id: campaignId }, data));
        });

        c.delete('/', async (request, reply) => {
          await db.delete(campaigns).where(eq(campaigns.id, request.campaignId));
          return reply.code(204).send();
        });

        registerCharacterRoutes(c);
        registerTurnRoutes(c, app.engine);
        registerStateRoutes(c);

        // ---------------------------------------------------- world and state collections

        registerCollection(c, {
          path: 'skills',
          label: 'Skill',
          table: skills,
          mutatorTable: 'skills',
          create: SkillCreate,
          update: SkillUpdate,
          orderBy: [desc(skills.level), asc(skills.name)],
        });

        registerCollection(c, {
          path: 'items',
          label: 'Item',
          table: inventoryItems,
          mutatorTable: 'inventory_items',
          create: ItemCreate,
          update: ItemUpdate,
          orderBy: [desc(inventoryItems.equipped), asc(inventoryItems.name)],
        });

        registerCollection(c, {
          path: 'locations',
          label: 'Location',
          table: locations,
          mutatorTable: 'locations',
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
          mutatorTable: 'npcs',
          create: NpcCreate,
          update: NpcUpdate,
          orderBy: [asc(npcs.name)],
        });

        registerCollection(c, {
          path: 'relationships',
          label: 'Relationship',
          table: relationships,
          mutatorTable: 'relationships',
          create: RelationshipCreate,
          update: RelationshipUpdate,
          orderBy: [desc(relationships.updatedAt)],
        });

        registerCollection(c, {
          path: 'lore',
          label: 'Lore entry',
          table: loreEntries,
          mutatorTable: 'lore_entries',
          create: LoreCreate,
          update: LoreUpdate,
          orderBy: [desc(loreEntries.alwaysInclude), asc(loreEntries.title)],
          hidden: ['searchVector'],
        });

        registerCollection(c, {
          path: 'missions',
          label: 'Mission',
          table: missions,
          mutatorTable: 'missions',
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
          const page = pageOf(rows, limit);
          // Each narrator message carries its turn's rolls and growth, so they stay visible after the turn.
          const turns = [...new Set(page.items.filter((m) => m.role === 'narrator').map((m) => m.turnNumber))];
          const events = turns.length
            ? await db
                .select({ turnNumber: stateEvents.turnNumber, eventType: stateEvents.eventType, humanReadable: stateEvents.humanReadable, payload: stateEvents.payload })
                .from(stateEvents)
                .where(
                  and(
                    eq(stateEvents.campaignId, request.campaignId),
                    inArray(stateEvents.turnNumber, turns),
                    inArray(stateEvents.eventType, [...HIGHLIGHT_EVENT_TYPES]),
                  ),
                )
                .orderBy(asc(stateEvents.id))
            : [];
          const byTurn = new Map<number, TurnHighlight[]>();
          for (const e of events) {
            const list = byTurn.get(e.turnNumber) ?? [];
            list.push({ eventType: e.eventType, humanReadable: e.humanReadable, details: (e.payload as { details?: Record<string, unknown> }).details ?? {} });
            byTurn.set(e.turnNumber, list);
          }
          return {
            ...page,
            items: page.items.map((m) => (m.role === 'narrator' && byTurn.has(m.turnNumber) ? { ...m, highlights: byTurn.get(m.turnNumber) } : m)),
          };
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
