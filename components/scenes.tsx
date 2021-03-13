import { clothConfig } from '../pages/cloth';
import { dusenConfig } from '../pages/dusen';
import { barsConfig } from './bars';
import { cubefieldConfig } from './cubefield';
import { chaosConfig } from './geometric_chaos';
import { sortConfig } from './sort';
import { spiroConfig } from './spiro';

export type sceneName =
  | 'spiro'
  | 'bars'
  | 'chaos'
  | 'cloth'
  | 'dusen'
  | 'cubefield'
  | 'sort';

export const scenes = {
  spiro: spiroConfig,
  bars: barsConfig,
  dusen: dusenConfig,
  cubefield: cubefieldConfig,
  chaos: chaosConfig,
  cloth: clothConfig,
  sort: sortConfig,
};

const possibleScenes = Object.values(scenes);
export type Scenes = typeof possibleScenes[number];
