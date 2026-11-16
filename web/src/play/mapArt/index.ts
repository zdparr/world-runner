import { emptyCrownMap } from './emptyCrown';
import { aldermereMap } from './aldermere';
import { azureMistMap } from './azureMist';
import { breachDayMap } from './breachDay';
import { brinecrossMap } from './brinecross';
import { fiveBannersMap } from './fiveBanners';
import { goddessBargainMap } from './goddessBargain';
import { harrowmereMap } from './harrowmere';
import { solvanzaMap } from './solvanza';
import { spireMap } from './spire';
import { thresholdMap } from './threshold';
import { varenholdMap } from './varenhold';
import type { MapArt } from './types';

export type { MapArt, Pt } from './types';

/** Drawn maps by id: a campaign's `map.art` names one (set from its world's `mapArt`). */
const ARTS: Record<string, MapArt> = {
  [emptyCrownMap.id]: emptyCrownMap,
  [aldermereMap.id]: aldermereMap,
  [azureMistMap.id]: azureMistMap,
  [breachDayMap.id]: breachDayMap,
  [brinecrossMap.id]: brinecrossMap,
  [fiveBannersMap.id]: fiveBannersMap,
  [goddessBargainMap.id]: goddessBargainMap,
  [harrowmereMap.id]: harrowmereMap,
  [solvanzaMap.id]: solvanzaMap,
  [spireMap.id]: spireMap,
  [thresholdMap.id]: thresholdMap,
  [varenholdMap.id]: varenholdMap,
};

export function findMapArt(id: string | null | undefined): MapArt | null {
  return id ? (ARTS[id] ?? null) : null;
}
