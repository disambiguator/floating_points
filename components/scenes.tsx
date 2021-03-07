import { spiroConfig } from '../pages/spiro';
import { barsConfig } from '../pages/bars';
import { dusenConfig } from './dusen';
import { cubefieldConfig } from './cubefield';
import { chaosConfig } from './geometric_chaos';
import { clothConfig } from '../pages/cloth';
import { sortConfig } from './sort';

export type sceneName =
  | 'spiro'
  | 'bars'
  | 'chaos'
  | 'cloth'
  | 'dusen'
  | 'cubefield'
  | 'sort';

export const scenes = () => ({
  spiro: spiroConfig,
  bars: barsConfig,
  dusen: dusenConfig,
  cubefield: cubefieldConfig,
  chaos: chaosConfig,
  cloth: clothConfig,
  sort: sortConfig,
});
