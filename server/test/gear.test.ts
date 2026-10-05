import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import { gearBonuses, gradeBonus, type GearItem } from '@narrator/shared';
import { createTestApp } from './helpers';
import { parseSse, scriptedModel, toolResultsIn, type Step } from './fake-model';
import { createFromTemplate } from '../src/db/seed/templates';

// Graded gear: Grade I-VII adds +1 to +7 to the checks an item enhances.

describe('gear rules', () => {
  const item = (over: Partial<GearItem>): GearItem => ({ name: 'Thing', equipped: true, grade: 1, usage: 'worn', enhances: [{ skill: 'Stealth' }], ...over });

  it('scales the bonus with the grade, and ungraded gear adds nothing', () => {
    expect([0, 1, 3, 7].map(gradeBonus)).toEqual([0, 1, 3, 7]);
  });

  it('counts the best worn item and the wielded item in use, matching skill or attribute', () => {
    const items = [
      item({ name: 'Ring', grade: 1, enhances: [{ attribute: 'agility' }] }),
      item({ name: 'Cloak', grade: 2, enhances: [{ skill: 'Sword fighting' }] }),
      item({ name: 'Charm', grade: 1, enhances: [{ skill: 'Sword fighting' }] }),
      item({ name: 'Crux Blade', grade: 3, usage: 'wielded', enhances: [{ skill: 'Sword fighting' }] }),
      item({ name: 'Stowed Blade', grade: 5, usage: 'wielded', equipped: false, enhances: [{ skill: 'Sword fighting' }] }),
    ];
    expect(gearBonuses(items, 'sword fighting', 'agility', 'crux blade')).toEqual([
      { item: 'Crux Blade', grade: 3, usage: 'wielded', bonus: 3 },
      { item: 'Cloak', grade: 2, usage: 'worn', bonus: 2 },
    ]);
    // A wielded item only counts while it is the one in use, and only while equipped.
    expect(gearBonuses(items, 'Sword fighting', undefined, undefined).map((g) => g.item)).toEqual(['Cloak']);
    expect(gearBonuses(items, 'Sword fighting', undefined, 'Stowed Blade').map((g) => g.item)).toEqual(['Cloak']);
    // An attribute match counts for any skill.
    expect(gearBonuses(items, 'Stealth', 'agility', undefined).map((g) => g.item)).toEqual(['Ring']);
  });
});

describe('gear in play', () => {
  let t: Awaited<ReturnType<typeof createTestApp>>;
  beforeAll(async () => {
    t = await createTestApp();
  }, 30_000);
  afterAll(async () => {
    await t?.close();
  });

  async function play(campaignId: string, content: string, steps: Step[]) {
    const model = scriptedModel(steps);
    t.setModel(model.stream);
    const res = await t.api('POST', `/api/campaigns/${campaignId}/turns`, { content });
    expect(parseSse(res.body).find((e) => e.type === 'error')).toBeUndefined();
    return model.calls;
  }
  const output = (call: Anthropic.MessageStreamParams, i = 0) => JSON.parse(toolResultsIn(call)[i]!.content as string);

  it('adds equipped graded gear to checks, shows it every turn, and regrades items', async () => {
    const id = await createFromTemplate(t.db, 'threshold', { name: 'Gear test', includeCharacter: true });
    await play(id, 'I gear up.', [
      {
        tools: [
          { name: 'add_item', input: { name: 'Crux Pry Bar', grade: 3, usage: 'wielded', enhances: [{ skill: 'Salvage' }] } },
          { name: 'add_item', input: { name: 'Calyx Band', grade: 1, enhances: [{ attribute: 'perception' }] } },
        ],
      },
      { tools: [{ name: 'equip_item', input: { name: 'Crux Pry Bar', equipped: true } }, { name: 'equip_item', input: { name: 'Calyx Band', equipped: true } }] },
      { text: 'Ready.' },
    ]);

    const calls = await play(id, 'I pry the panel open.', [
      // "pry bar" also matches the seeded Corbel pry bar: refused before rolling, so the narrator can fix it.
      { tools: [{ name: 'skill_check', input: { skill_name: 'Salvage', difficulty: 'hard', attribute: 'perception', using: 'pry bar' } }] },
      { tools: [{ name: 'skill_check', input: { skill_name: 'Salvage', difficulty: 'hard', attribute: 'perception', using: 'Crux Pry Bar' } }] },
      { tools: [{ name: 'skill_check', input: { skill_name: 'Salvage', difficulty: 'hard', attribute: 'perception', using: 'Corbel pry bar' } }] },
      { text: 'It gives.' },
    ]);
    expect(toolResultsIn(calls[1]!)[0]).toMatchObject({ is_error: true });
    expect(toolResultsIn(calls[1]!)[0]!.content).toContain('Nothing was rolled');
    const withBar = output(calls[2]!);

    expect(withBar.breakdown.gear).toEqual([
      { item: 'Crux Pry Bar', bonus: 3 },
      { item: 'Calyx Band', bonus: 1 },
    ]);
    // Salvage 3 + Perception 7 (+2) + level 1 (+0) + gear 4.
    expect(withBar.modifier).toBe(9);
    // Ordinary (ungraded) gear adds nothing; the worn band still counts.
    const withoutBar = output(calls[3]!);
    expect(withoutBar.breakdown.gear).toEqual([{ item: 'Calyx Band', bonus: 1 }]);
    expect(withoutBar.modifier).toBe(6);

    const context = (calls[0]!.system as Anthropic.TextBlockParam[])[1]!.text;
    expect(context).toContain('Equipped gear with check bonuses');
    expect(context).toContain('Crux Pry Bar (Grade III, wielded: Salvage +3); Calyx Band (Grade I, worn: Perception +1)');

    const regrade = await play(id, 'The band cracks.', [
      { tools: [{ name: 'update_item', input: { name: 'Calyx Band', grade: 0, reason: 'cracked in the blast' } }] },
      { text: 'Dull now.' },
    ]);
    expect(output(regrade[1]!)).toMatchObject({ name: 'Calyx Band', grade: 0 });
    const items = (await t.api('GET', `/api/campaigns/${id}/items`)).json();
    expect(items.find((i: { name: string }) => i.name === 'Calyx Band')).toMatchObject({ grade: 0, usage: 'worn', enhances: [{ attribute: 'perception' }] });
  });
});
