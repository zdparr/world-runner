import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers';

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

async function newCampaign() {
  return (await t.api('POST', '/api/campaigns', { name: 'Sheet test' })).json() as { id: string };
}

const character = { name: 'Wren', archetype: 'scholar', bio: 'Reads too much.', money: 25, hp: 12, maxHp: 12 };

describe('templates', () => {
  it('lists templates without colliding with campaign ids', async () => {
    const res = await t.api('GET', '/api/campaigns/templates');
    expect(res.statusCode).toBe(200);
    expect(res.json().map((t: { id: string }) => t.id)).toEqual(['varenhold', 'brinecross']);
    expect(res.json()[0]).toMatchObject({ name: 'Varenhold', description: expect.stringMatching(/fantasy/) });
  });

  it('creates a campaign from a template without a character by default', async () => {
    const res = await t.api('POST', '/api/campaigns/from-template', { templateId: 'varenhold', name: 'My Varenhold' });
    expect(res.statusCode).toBe(201);
    const { id, name, currencyName } = res.json();
    expect({ name, currencyName }).toEqual({ name: 'My Varenhold', currencyName: 'gold' });

    const sheet = (await t.api('GET', `/api/campaigns/${id}/character/sheet`)).json();
    expect(sheet).toEqual({ character: null, skills: [], items: [] });
    expect((await t.api('GET', `/api/campaigns/${id}/npcs`)).json()).toHaveLength(4);
    expect((await t.api('GET', `/api/campaigns/${id}/relationships`)).json()).toHaveLength(0);
  });

  it('can include the pre-made character', async () => {
    const res = await t.api('POST', '/api/campaigns/from-template', {
      templateId: 'brinecross',
      name: 'With Kael',
      includeCharacter: true,
    });
    const sheet = (await t.api('GET', `/api/campaigns/${res.json().id}/character/sheet`)).json();
    expect(sheet.character.name).toBe('Kael');
    expect(sheet.skills).toHaveLength(5);
  });

  it('404s for an unknown template', async () => {
    expect((await t.api('POST', '/api/campaigns/from-template', { templateId: 'nope', name: 'x' })).statusCode).toBe(404);
  });
});

describe('character sheet', () => {
  it('creates, updates, and prunes skills and items in one save', async () => {
    const { id } = await newCampaign();
    const url = `/api/campaigns/${id}/character/sheet`;

    const first = await t.api('PUT', url, {
      character,
      skills: [{ name: 'History', level: 3 }, { name: 'Herbalism' }],
      items: [{ name: 'Notebook' }, { name: 'Candle', quantity: 4, tags: ['light'] }],
    });
    expect(first.statusCode).toBe(200);
    const sheet = first.json();
    expect(sheet.character).toMatchObject({ name: 'Wren', money: 25, level: 1 });
    expect(sheet.skills.map((s: { name: string }) => s.name)).toEqual(['History', 'Herbalism']);
    expect(sheet.items).toHaveLength(2);

    const history = sheet.skills.find((s: { name: string }) => s.name === 'History');
    const candle = sheet.items.find((i: { name: string }) => i.name === 'Candle');

    // Keep History (renamed), drop Herbalism; keep Candle (edited), drop Notebook, add Lantern.
    const second = await t.api('PUT', url, {
      character: { ...character, name: 'Wren Ashdown' },
      skills: [{ id: history.id, name: 'Old History', level: 4 }],
      items: [
        { id: candle.id, name: 'Candle', quantity: 2 },
        { name: 'Lantern', equipped: true },
      ],
    });
    expect(second.statusCode).toBe(200);
    const updated = second.json();
    expect(updated.character.name).toBe('Wren Ashdown');
    expect(updated.skills).toEqual([expect.objectContaining({ id: history.id, name: 'Old History', level: 4 })]);
    expect(updated.items.map((i: { name: string; quantity: number }) => [i.name, i.quantity])).toEqual([
      ['Lantern', 1],
      ['Candle', 2],
    ]);
  });

  it('lets a removed name be reused in the same save', async () => {
    const { id } = await newCampaign();
    const url = `/api/campaigns/${id}/character/sheet`;
    await t.api('PUT', url, { character, skills: [{ name: 'Stealth' }], items: [] });
    const res = await t.api('PUT', url, { character, skills: [{ name: 'stealth', level: 2 }], items: [] });
    expect(res.statusCode).toBe(200);
    expect(res.json().skills).toEqual([expect.objectContaining({ name: 'stealth', level: 2 })]);
  });

  it('rejects duplicate names, bad values, and ids from another campaign, without partial writes', async () => {
    const { id } = await newCampaign();
    const other = await newCampaign();
    const url = `/api/campaigns/${id}/character/sheet`;

    const dup = await t.api('PUT', url, { character, skills: [{ name: 'Stealth' }, { name: 'STEALTH' }], items: [] });
    expect(dup.statusCode).toBe(400);
    expect(dup.json().error).toMatch(/Two skills are named/);

    expect((await t.api('PUT', url, { character: { ...character, hp: 99 }, skills: [], items: [] })).statusCode).toBe(400);

    const foreign = (
      await t.api('PUT', `/api/campaigns/${other.id}/character/sheet`, { character, skills: [{ name: 'Theirs' }], items: [] })
    ).json().skills[0];
    const stolen = await t.api('PUT', url, { character, skills: [{ id: foreign.id, name: 'Mine now' }], items: [] });
    expect(stolen.statusCode).toBe(400);

    // Nothing from the failed saves landed.
    expect((await t.api('GET', url)).json()).toEqual({ character: null, skills: [], items: [] });
  });
});
