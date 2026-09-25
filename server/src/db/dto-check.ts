// Compile-time only: fails `npm run typecheck` if a table's JSON shape drifts from its DTO in @narrator/shared.
import type * as Dto from '@narrator/shared';
import type * as S from './schema';

type Jsonify<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Jsonify<U>[]
    : T extends object
      ? { [K in keyof T]: Jsonify<T[K]> }
      : T;
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Expect<T extends true> = T;
type Api<T extends { $inferSelect: unknown }> = Jsonify<Omit<T['$inferSelect'], 'searchVector'>>;

export type DtoChecks = [
  Expect<Same<Api<typeof S.campaigns>, Dto.Campaign>>,
  Expect<Same<Api<typeof S.playerCharacter>, Dto.PlayerCharacter>>,
  Expect<Same<Api<typeof S.skills>, Dto.Skill>>,
  Expect<Same<Api<typeof S.inventoryItems>, Dto.InventoryItem>>,
  Expect<Same<Api<typeof S.locations>, Dto.Location>>,
  Expect<Same<Api<typeof S.npcs>, Dto.Npc>>,
  Expect<Same<Api<typeof S.relationships>, Dto.Relationship>>,
  Expect<Same<Api<typeof S.loreEntries>, Dto.LoreEntry>>,
  Expect<Same<Api<typeof S.missions>, Dto.Mission>>,
  Expect<Same<Api<typeof S.messages>, Dto.Message>>,
  Expect<Same<Api<typeof S.stateEvents>, Dto.StateEvent>>,
  Expect<Same<Api<typeof S.turnDebug>, Dto.TurnDebug>>,
];
