import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { and, eq } from 'drizzle-orm';
import { bearing, describeHours, describeRoute, offset, type CampaignState } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { locations } from '../src/db/schema';
import { createFromTemplate } from '../src/db/seed/templates';

// The world map: places have positions in hours on foot (x east, y north), so the map can be drawn to scale
// and the narrator knows which way and how far things are.

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
}, 30_000);
afterAll(async () => {
  await t?.close();
});

let seq = 0;
const newCampaign = (template: string) => createFromTemplate(t.db, template, { name: `Map test ${++seq}`, includeCharacter: true });

async function play(campaignId: string, steps: Step[]) {
  const model = scriptedModel(steps);
  t.setModel(model.stream);
  const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content: 'I look around.' });
  const events = parseSse(res.body);
  expect(events.find((e) => e.type === 'error')).toBeUndefined();
  return model.calls;
}
const dynamicContext = (call: Anthropic.MessageStreamParams) => (call.system as Anthropic.TextBlockParam[])[1]!.text;
const results = (call: Anthropic.MessageStreamParams) => toolResultsIn(call).map((r) => String(r.content));
const position = async (campaignId: string, name: string) => {
  const [row] = await t.db
    .select({ x: locations.mapX, y: locations.mapY })
    .from(locations)
    .where(and(eq(locations.campaignId, campaignId), eq(locations.name, name)));
  return row;
};

describe('map geometry', () => {
  it('measures compass offsets, bearings, and travel times', () => {
    expect(offset({ x: 0, y: 0 }, 'N', 8)).toEqual({ x: 0, y: 8 });
    expect(offset({ x: 2, y: 1 }, 'W', 3)).toEqual({ x: -1, y: 1 });
    expect(offset({ x: 0, y: 0 }, 'NE', 10)).toEqual({ x: 7.07, y: 7.07 });
    expect(bearing({ x: 0, y: 0 }, { x: -5, y: -5 })).toBe('SW');
    expect(bearing({ x: 0, y: 0 }, { x: 1, y: 10 })).toBe('N');
    expect(describeHours(0.3)).toBe('under an hour');
    expect(describeHours(3)).toBe('3 hours');
    expect(describeHours(16)).toBe('about 2 days');
    expect(describeRoute({ x: 0, y: 0 }, { x: -8, y: 0 })).toBe('about 1 day west');
  });
});

describe('a mapped world (The Empty Crown)', () => {
  it('sends positions to the map, with sub-locations unplaced inside their town', async () => {
    const id = await newCampaign('empty-crown');
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    const byName = new Map(state.map.locations.map((l) => [l.name, l]));
    expect(byName.get('Thornwick')!.position).toEqual({ x: 0, y: 0 });
    expect(byName.get('Ashen Keep')!.position).toEqual({ x: 0, y: 16 });
    expect(byName.get('The Crooked Ox')!.position).toBeNull();
    expect(byName.get('The Crooked Ox')!.parentLocationId).toBe(byName.get('Thornwick')!.id);
  });

  it("tells the narrator which way and how far the nearest places are, measured from the tavern's town", async () => {
    const id = await newCampaign('empty-crown');
    const calls = await play(id, [{ text: 'Rain on the shutters.' }]);
    const context = dynamicContext(calls[0]!);
    expect(context).toMatch(/Nearby \(on foot; keep travel consistent with this\): Hob's Ford, about 1 day west; .*The Wending Wood, about 1\.5 days south/);
    expect(context).toContain('Ashen Keep, about 2 days north');
    // The town it is in, and its sibling rooms, are not "nearby".
    expect(context).not.toMatch(/Nearby[^\n]*Thornwick,/);
    expect(context).not.toContain('Places not on the map yet');
  });

  it('places a new location by direction and travel time from a place on the map, and reports what is near it', async () => {
    const id = await newCampaign('empty-crown');
    const calls = await play(id, [
      {
        tools: [
          {
            name: 'create_location',
            input: {
              name: 'Barrow Down',
              description: 'Grassy mounds under a wide sky.',
              purpose: 'Old Calder graves.',
              position: { from: 'Thornwick', direction: 'NE', hours: 8 },
            },
          },
        ],
      },
      { tools: [{ name: 'get_location', input: { name: 'Barrow Down' } }] },
      { text: 'Mounds on the horizon.' },
    ]);
    expect(await position(id, 'Barrow Down')).toEqual({ x: 5.66, y: 5.66 });
    const view = JSON.parse(results(calls[2]!)[0]!);
    expect(view.nearby[0]).toEqual({ name: 'Thornwick', route: 'about 1 day southwest' });
  });

  it("measures from a sub-location as from its town, and refuses a place that is not on the map at all", async () => {
    const id = await newCampaign('empty-crown');
    const calls = await play(id, [
      {
        tools: [
          { name: 'update_location', input: { name: 'Ashen Keep', position: { from: 'The Crooked Ox', direction: 'N', hours: 12 } } },
          { name: 'create_location', input: { name: 'Lonely Tor', description: 'A crag.', purpose: 'A lookout.' } },
          { name: 'update_location', input: { name: "Hob's Ford", position: { from: 'Lonely Tor', direction: 'S', hours: 4 } } },
        ],
      },
      { text: 'Hm.' },
    ]);
    expect(await position(id, 'Ashen Keep')).toEqual({ x: 0, y: 12 });
    expect(results(calls[1]!)[2]).toMatch(/Lonely Tor is not on the map yet\. Measure from a place that is \(.*Thornwick/);
    expect(await position(id, "Hob's Ford")).toEqual({ x: -8, y: 0 });
  });
});

describe('a world with no map yet (Brinecross)', () => {
  it('has no positions and no nudge to add them', async () => {
    const id = await newCampaign('brinecross');
    const state = (await t.api('GET', `/api/campaigns/${id}/state`)).json() as CampaignState;
    expect(state.map.locations.every((l) => l.position === null)).toBe(true);
    const calls = await play(id, [{ text: 'Gulls.' }]);
    expect(dynamicContext(calls[0]!)).not.toContain('Places not on the map yet');
    expect(dynamicContext(calls[0]!)).not.toContain('Nearby (on foot');
  });

  it('anchors the map on the first place measured from, then asks for the rest to be placed', async () => {
    const id = await newCampaign('brinecross');
    await play(id, [
      { tools: [{ name: 'update_location', input: { name: 'The Saltworks', position: { from: 'Dockside Market', direction: 'E', hours: 1 } } }] },
      { text: 'Steam over the pans.' },
    ]);
    expect(await position(id, 'Dockside Market')).toEqual({ x: 0, y: 0 });
    expect(await position(id, 'The Saltworks')).toEqual({ x: 1, y: 0 });

    const calls = await play(id, [{ text: 'Later.' }]);
    const context = dynamicContext(calls[0]!);
    expect(context).toMatch(/Places not on the map yet: [^\n]*The Drowned Streets/);
    expect(context).not.toMatch(/Places not on the map yet: [^\n]*The Saltworks/);

    // Undo takes the anchor back off the map along with the rest of the turn.
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    expect((await t.api('POST', `/api/campaigns/${id}/turns/undo`)).statusCode).toBe(200);
    expect(await position(id, 'Dockside Market')).toEqual({ x: null, y: null });
  });
});
