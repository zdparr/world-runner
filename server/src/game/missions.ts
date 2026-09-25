import type { MissionObjective, MissionObjectiveInput } from '@narrator/shared';

/** Give every objective a stable id (`o1`, `o2`, ...), keeping ids that were supplied and unique. */
export function normalizeObjectives(input: MissionObjectiveInput[]): MissionObjective[] {
  const used = new Set<string>();
  const kept = input.map((o) => {
    if (o.id && !used.has(o.id)) {
      used.add(o.id);
      return o.id;
    }
    return null;
  });
  let next = 1;
  return input.map((o, i) => {
    let id = kept[i];
    if (!id) {
      while (used.has(`o${next}`)) next++;
      id = `o${next}`;
      used.add(id);
    }
    return { id, text: o.text, done: o.done ?? false };
  });
}
