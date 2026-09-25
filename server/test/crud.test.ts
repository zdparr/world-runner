import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { createTestApp } from './helpers';
import { campaigns, messages, npcs } from '../src/db/schema';
import { TEMPLATES, seedDemoCampaign } from '../src/db/seed/templates';
import { varenhold } from '../src/db/seed/worlds/varenhold';

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

async function newCampaign(name = 'Test Campaign') {
  const res = await t.api('POST', '/api/campaigns', { name });
  expect(res.statusCode).toBe(201);
  return res.json() as { id: string };
}

describe('campaigns', () => {
  it('creates with defaults, lists, renames, and deletes', async () => {
    const created = await t.api('POST', '/api/campaigns', { name: '  Spaced Out  ' });
    expect(created.statusCode).toBe(201);
    const c = created.json();
    expect(c).toMatchObject({ name: 'Spaced Out', turnCount: 0, historyWindow: 8, summaryInterval: 10, currencyName: 'gold' });
    expect(Number.isInteger(c.rngSeed)).toBe(true);

    const list = (await t.api('GET', '/api/campaigns')).json() as { id: string; characterName: string | null }[];
    expect(list.find((x) => x.id === c.id)).toMatchObject({ characterName: null });

    const renamed = await t.api('PATCH', `/api/campaigns/${c.id}`, { name: 'Renamed' });
    expect(renamed.json().name).toBe('Renamed');

    expect((await t.api('DELETE', `/api/campaigns/${c.id}`)).statusCode).toBe(204);
    expect((await t.api('GET', `/api/campaigns/${c.id}`)).statusCode).toBe(404);
  });

  it('rejects unknown fields and empty patches', async () => {
    const { id } = await newCampaign();
    expect((await t.api('POST', '/api/campaigns', { name: 'x', turnCount: 99 })).statusCode).toBe(400);
    const empty = await t.api('PATCH', `/api/campaigns/${id}`, {});
    expect(empty.statusCode).toBe(400);
    expect(empty.json().error).toMatch(/Nothing to update/);
  });

  it('404s for missing or malformed campaign ids on nested routes', async () => {
    expect((await t.api('GET', '/api/campaigns/00000000-0000-4000-8000-000000000000/skills')).statusCode).toBe(404);
    expect((await t.api('GET', '/api/campaigns/not-a-uuid/skills')).statusCode).toBe(404);
  });

  it('cascades deletes to every campaign-scoped row', async () => {
    const { id } = await newCampaign();
    await t.api('POST', `/api/campaigns/${id}/npcs`, { name: 'Doomed' });
    await t.api('DELETE', `/api/campaigns/${id}`);
    expect(await t.db.select().from(npcs).where(eq(npcs.campaignId, id))).toHaveLength(0);
  });
});

describe('player character', () => {
  it('upserts, patches, and enforces invariants', async () => {
    const { id } = await newCampaign();
    const base = `/api/campaigns/${id}/character`;
    expect((await t.api('GET', base)).statusCode).toBe(404);

    const put = await t.api('PUT', base, { name: 'Kael', archetype: 'rogue', money: 40, hp: 18, maxHp: 22 });
    expect(put.statusCode).toBe(200);
    expect(put.json()).toMatchObject({ name: 'Kael', money: 40, level: 1, statusEffects: [] });

    expect((await t.api('PUT', base, { name: 'Kael', money: -1 })).statusCode).toBe(400);
    expect((await t.api('PUT', base, { name: 'Kael', hp: 30, maxHp: 22 })).statusCode).toBe(400);

    // A partial update that breaks hp <= maxHp is caught by the DB check constraint.
    const badPatch = await t.api('PATCH', base, { maxHp: 5 });
    expect(badPatch.statusCode).toBe(400);
    expect(badPatch.json().error).toBe('HP must be between 0 and max HP');

    const patched = await t.api('PATCH', base, { money: 1340 });
    expect(patched.json()).toMatchObject({ money: 1340, hp: 18, maxHp: 22 });

    expect((await t.api('GET', '/api/campaigns')).json().find((c: { id: string }) => c.id === id).characterName).toBe('Kael');
  });

  it('rejects a location from another campaign', async () => {
    const a = await newCampaign('A');
    const b = await newCampaign('B');
    const loc = (await t.api('POST', `/api/campaigns/${b.id}/locations`, { name: 'Elsewhere' })).json();
    const res = await t.api('PUT', `/api/campaigns/${a.id}/character`, { name: 'Kael', currentLocationId: loc.id });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/currentLocationId: no such location/);
  });
});

describe('collections', () => {
  it('supports the full CRUD cycle', async () => {
    const { id } = await newCampaign();
    const base = `/api/campaigns/${id}/items`;
    const created = await t.api('POST', base, { name: 'Rope', tags: ['Tool', 'climbing'] });
    expect(created.statusCode).toBe(201);
    const item = created.json();
    expect(item).toMatchObject({ quantity: 1, tags: ['tool', 'climbing'], equipped: false, properties: {} });

    expect((await t.api('GET', `${base}/${item.id}`)).json().name).toBe('Rope');
    expect((await t.api('PATCH', `${base}/${item.id}`, { quantity: 3 })).json().quantity).toBe(3);
    expect((await t.api('PATCH', `${base}/${item.id}`, { quantity: 0 })).statusCode).toBe(400);
    expect((await t.api('GET', base)).json()).toHaveLength(1);
    expect((await t.api('DELETE', `${base}/${item.id}`)).statusCode).toBe(204);
    expect((await t.api('DELETE', `${base}/${item.id}`)).statusCode).toBe(404);
  });

  it('scopes rows to their campaign', async () => {
    const a = await newCampaign('A');
    const b = await newCampaign('B');
    const skill = (await t.api('POST', `/api/campaigns/${a.id}/skills`, { name: 'Sailing' })).json();
    expect((await t.api('GET', `/api/campaigns/${b.id}/skills/${skill.id}`)).statusCode).toBe(404);
    expect((await t.api('PATCH', `/api/campaigns/${b.id}/skills/${skill.id}`, { level: 9 })).statusCode).toBe(404);
    expect((await t.api('DELETE', `/api/campaigns/${b.id}/skills/${skill.id}`)).statusCode).toBe(404);
  });

  it('enforces case-insensitive unique names per campaign', async () => {
    const a = await newCampaign('A');
    const b = await newCampaign('B');
    expect((await t.api('POST', `/api/campaigns/${a.id}/skills`, { name: 'Stealth' })).statusCode).toBe(201);
    const dup = await t.api('POST', `/api/campaigns/${a.id}/skills`, { name: 'stealth' });
    expect(dup.statusCode).toBe(409);
    expect(dup.json().error).toBe('A skill with that name already exists');
    expect((await t.api('POST', `/api/campaigns/${b.id}/skills`, { name: 'Stealth' })).statusCode).toBe(201);
  });

  it('prevents location cycles', async () => {
    const { id } = await newCampaign();
    const base = `/api/campaigns/${id}/locations`;
    const city = (await t.api('POST', base, { name: 'City' })).json();
    const market = (await t.api('POST', base, { name: 'Market', parentLocationId: city.id })).json();
    expect((await t.api('PATCH', `${base}/${city.id}`, { parentLocationId: market.id })).statusCode).toBe(400);
    expect((await t.api('PATCH', `${base}/${city.id}`, { parentLocationId: city.id })).statusCode).toBe(400);
    expect((await t.api('PATCH', `${base}/${market.id}`, { parentLocationId: null })).statusCode).toBe(200);
  });

  it('validates relationships', async () => {
    const { id } = await newCampaign();
    const npc = (await t.api('POST', `/api/campaigns/${id}/npcs`, { name: 'Mara' })).json();
    const base = `/api/campaigns/${id}/relationships`;
    expect((await t.api('POST', base, { npcId: npc.id, affinity: 150 })).statusCode).toBe(400);
    const rel = await t.api('POST', base, { npcId: npc.id, affinity: 20, status: 'ally' });
    expect(rel.statusCode).toBe(201);
    expect(rel.json()).toMatchObject({ trust: 0, notesSinceCondense: 0 });
    expect((await t.api('POST', base, { npcId: npc.id })).statusCode).toBe(409);
    // npcId is fixed once created.
    expect((await t.api('PATCH', `${base}/${rel.json().id}`, { npcId: npc.id })).statusCode).toBe(400);
  });

  it('assigns objective ids and orders missions by lifecycle', async () => {
    const { id } = await newCampaign();
    const base = `/api/campaigns/${id}/missions`;
    const m = await t.api('POST', base, {
      title: 'Find the crate',
      objectives: [{ text: 'Ask around' }, { id: 'o1', text: 'Kept id' }, { text: 'Report back', done: true }],
      rewards: { money: 250 },
    });
    expect(m.statusCode).toBe(201);
    expect(m.json().objectives).toEqual([
      { id: 'o2', text: 'Ask around', done: false },
      { id: 'o1', text: 'Kept id', done: false },
      { id: 'o3', text: 'Report back', done: true },
    ]);
    expect(m.json()).toMatchObject({ status: 'offered', rewardsGranted: false, rewards: { money: 250 } });

    await t.api('POST', base, { title: 'Active one', status: 'active' });
    await t.api('POST', base, { title: 'Old news', status: 'completed' });
    const order = ((await t.api('GET', base)).json() as { title: string }[]).map((x) => x.title);
    expect(order).toEqual(['Active one', 'Find the crate', 'Old news']);

    expect((await t.api('POST', base, { title: 'Bad', status: 'abandoned' })).statusCode).toBe(400);
    expect((await t.api('POST', base, { title: 'Bad', rewards: { money: -5 } })).statusCode).toBe(400);
  });

  it('hides lore search vectors but populates them', async () => {
    const { id } = await newCampaign();
    const res = await t.api('POST', `/api/campaigns/${id}/lore`, {
      title: 'Sunstone Oil',
      body: 'A lamp fuel that burns gold.',
      keywords: ['Sunstone', 'contraband'],
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).not.toHaveProperty('searchVector');
    expect(res.json().keywords).toEqual(['sunstone', 'contraband']);

    const hits = await t.db.execute(
      sql`select title from lore_entries where campaign_id = ${id} and search_vector @@ plainto_tsquery('english', 'burning lamps')`,
    );
    expect((hits as unknown as { rows: unknown[] }).rows).toEqual([{ title: 'Sunstone Oil' }]);
  });
});

describe('history', () => {
  it('pages messages newest-first, returning each page oldest-first', async () => {
    const { id } = await newCampaign();
    await t.db.insert(messages).values(
      [1, 2, 3, 4, 5].map((n) => ({ campaignId: id, turnNumber: n, role: 'player' as const, content: `msg ${n}` })),
    );
    const page1 = (await t.api('GET', `/api/campaigns/${id}/messages?limit=2`)).json();
    expect(page1.items.map((m: { content: string }) => m.content)).toEqual(['msg 4', 'msg 5']);
    expect(page1.items[0]).not.toHaveProperty('searchVector');

    const page2 = (await t.api('GET', `/api/campaigns/${id}/messages?limit=2&before=${page1.nextBefore}`)).json();
    expect(page2.items.map((m: { content: string }) => m.content)).toEqual(['msg 2', 'msg 3']);

    const page3 = (await t.api('GET', `/api/campaigns/${id}/messages?limit=2&before=${page2.nextBefore}`)).json();
    expect(page3).toMatchObject({ nextBefore: null });
    expect(page3.items).toHaveLength(1);
  });

  it('404s for a turn without debug data', async () => {
    const { id } = await newCampaign();
    expect((await t.api('GET', `/api/campaigns/${id}/turns/1/debug`)).statusCode).toBe(404);
    expect((await t.api('GET', `/api/campaigns/${id}/turns/zero/debug`)).statusCode).toBe(400);
  });
});

describe('seed', () => {
  it('creates the default demo campaign (Varenhold) once, and recreates it on reset', async () => {
    const id = await seedDemoCampaign(t.db);
    expect(id).toBeTruthy();
    expect(await seedDemoCampaign(t.db)).toBeNull();

    const count = async (path: string) => ((await t.api('GET', `/api/campaigns/${id}/${path}`)).json() as unknown[]).length;
    expect(await count('npcs')).toBe(4);
    expect(await count('locations')).toBe(3);
    expect(await count('lore')).toBe(5);
    expect(await count('missions')).toBe(1);
    expect(await count('relationships')).toBe(3);
    expect(await count('skills')).toBe(5);
    expect(await count('items')).toBe(6);

    const campaign = (await t.api('GET', `/api/campaigns/${id}`)).json();
    expect(campaign).toMatchObject({ name: 'Varenhold: The Silent Watchtower', currencyName: 'gold' });
    const character = (await t.api('GET', `/api/campaigns/${id}/character`)).json();
    expect(character).toMatchObject({ name: 'Rowan Ashford', archetype: 'Stormguard spellsword', money: 35 });
    const mission = (await t.api('GET', `/api/campaigns/${id}/missions`)).json()[0];
    expect(mission).toMatchObject({ title: 'The Silent Watchtower', status: 'offered' });
    expect(mission.objectives.map((o: { id: string }) => o.id)).toEqual(['o1', 'o2', 'o3', 'o4']);

    const newId = await seedDemoCampaign(t.db, { reset: true });
    expect(newId).not.toBe(id);
    expect(await t.db.select().from(campaigns).where(eq(campaigns.name, varenhold.demoCampaignName))).toHaveLength(1);
  });

  it('seeds every world, with every name reference resolving', async () => {
    for (const world of TEMPLATES) {
      if (world.id === 'varenhold') continue; // seeded above
      const id = await seedDemoCampaign(t.db, { templateId: world.id });
      expect(id, world.id).toBeTruthy();
      const npcs = (await t.api('GET', `/api/campaigns/${id}/npcs`)).json() as { locationId: string | null }[];
      expect(npcs.every((n) => n.locationId), world.id).toBe(true);
      expect((await t.api('GET', `/api/campaigns/${id}/character`)).json().currentLocationId, world.id).toBeTruthy();
    }
  });
});
