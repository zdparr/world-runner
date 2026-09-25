import { z } from 'zod';

export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`);
export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details);

/** Parse a request body/query with zod, throwing a 400 with field-level details on failure. */
export function parseWith<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input ?? {});
  if (result.success) return result.data;
  const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  const first = details[0];
  throw badRequest(first ? `${first.path ? `${first.path}: ` : ''}${first.message}` : 'Invalid request', details);
}

const Uuid = z.uuid();

/** Route ids that are not UUIDs can't exist; answer 404 rather than letting Postgres raise 22P02. */
export function parseId(value: unknown, what: string): string {
  const result = Uuid.safeParse(value);
  if (!result.success) throw notFound(what);
  return result.data;
}

// ---------------------------------------------------------------- Postgres errors

interface PgErrorLike {
  code: string;
  constraint?: string;
}

/** Drizzle wraps driver errors; walk the cause chain to find the Postgres error (node-postgres or PGlite). */
export function findPgError(err: unknown): PgErrorLike | null {
  let current: unknown = err;
  for (let depth = 0; current && depth < 5; depth++) {
    if (typeof current === 'object' && 'code' in current && typeof current.code === 'string' && /^[0-9A-Z]{5}$/.test(current.code)) {
      return current as PgErrorLike;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

const CONSTRAINT_MESSAGES: Record<string, string> = {
  locations_campaign_name_uq: 'A location with that name already exists',
  skills_campaign_name_uq: 'A skill with that name already exists',
  inventory_campaign_name_uq: 'An item with that name already exists (items stack by name; adjust its quantity instead)',
  npcs_campaign_name_uq: 'An NPC with that name already exists',
  missions_campaign_title_uq: 'A mission with that title already exists',
  relationships_npcId_unique: 'That NPC already has a relationship',
  player_money_nonnegative: 'Money cannot be negative',
  player_hp_range: 'HP must be between 0 and max HP',
  relationships_affinity_range: 'Affinity must be between -100 and 100',
  relationships_trust_range: 'Trust must be between -100 and 100',
  inventory_quantity_positive: 'Quantity must be at least 1',
};

/** Map constraint violations to client errors. Returns null for anything that is a genuine server fault. */
export function httpErrorFromPg(err: unknown): HttpError | null {
  const pgErr = findPgError(err);
  if (!pgErr) return null;
  const friendly = pgErr.constraint ? CONSTRAINT_MESSAGES[pgErr.constraint] : undefined;
  switch (pgErr.code) {
    case '23505': // unique_violation
      return new HttpError(409, friendly ?? 'That already exists');
    case '23514': // check_violation
      return badRequest(friendly ?? 'Value out of range');
    case '23503': // foreign_key_violation
      return badRequest('Referenced record does not exist');
    case '22P02': // invalid_text_representation (e.g. malformed uuid)
      return badRequest('Malformed identifier');
    default:
      return null;
  }
}
