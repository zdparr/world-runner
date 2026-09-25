import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Db } from '../db/client';

/** A tool failure the model should see and can correct (returned as an `is_error` tool result). */
export class ToolError extends Error {}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Find one campaign row by name, forgivingly: exact (case-insensitive), then substring, then any word.
 * The model often uses short forms ("Mara" for "Mara Vell"). Ambiguity and misses become ToolErrors
 * that list the candidates, so the model can retry with the right name.
 */
export async function findByName<T extends Record<string, unknown>>(
  db: Db,
  opts: {
    table: PgTable & { campaignId: PgColumn };
    nameColumn: PgColumn;
    campaignId: string;
    query: string;
    label: string;
  },
): Promise<T> {
  const found = await findOptional<T>(db, opts);
  if (found) return found;
  const known = (await db
    .select({ name: opts.nameColumn })
    .from(opts.table as never)
    .where(eq(opts.table.campaignId, opts.campaignId))
    .limit(30)) as { name: string }[];
  const list = known.length > 0 ? ` Known ${opts.label}s: ${known.map((k) => k.name).join(', ')}.` : ` There are no ${opts.label}s yet.`;
  throw new ToolError(`No ${opts.label} named "${opts.query}".${list}`);
}

/** Like findByName, but returns null when nothing matches (still throws on ambiguity). */
export async function findOptional<T extends Record<string, unknown>>(
  db: Db,
  { table, nameColumn, campaignId, query, label }: Parameters<typeof findByName>[1],
): Promise<T | null> {
  const q = query.trim();
  if (!q) throw new ToolError(`A ${label} name is required.`);
  const inCampaign = eq(table.campaignId, campaignId);
  const select = (where: ReturnType<typeof and>) =>
    db
      .select()
      .from(table as never)
      .where(and(inCampaign, where))
      .limit(10) as unknown as Promise<T[]>;

  const exact = await select(sql`lower(${nameColumn}) = lower(${q})`);
  if (exact.length > 0) return exact[0]!;

  const partial = await select(ilike(nameColumn, `%${escapeLike(q)}%`));
  if (partial.length === 1) return partial[0]!;
  if (partial.length > 1) throw ambiguous(label, q, partial);

  const words = q.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length > 0) {
    const byWord = await select(or(...words.map((w) => ilike(nameColumn, `%${escapeLike(w)}%`))));
    if (byWord.length === 1) return byWord[0]!;
    if (byWord.length > 1) throw ambiguous(label, q, byWord);
  }
  return null;
}

function ambiguous(label: string, q: string, rows: Record<string, unknown>[]): ToolError {
  const names = rows.map((r) => String(r.name ?? r.title)).join(', ');
  return new ToolError(`Several ${label}s match "${q}": ${names}. Use the full name.`);
}
