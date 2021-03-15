import DusenShader from '../lib/shaders/dusen';
import { barsConfig } from '../pages/bars';
import { clothConfig } from '../pages/cloth';
import { dusenConfig } from '../pages/dusen';
import { spiroConfig } from '../pages/spiro';
import { cubefieldConfig } from './cubefield';
import { chaosConfig } from './geometric_chaos';
import { sortConfig } from './sort';

export const shaders = {
  dusen: DusenShader,
};
export type ShaderName = keyof typeof shaders;

export const scenes = () => ({
  spiro: spiroConfig,
  bars: barsConfig,
  dusen: dusenConfig,
  cubefield: cubefieldConfig,
  chaos: chaosConfig,
  cloth: clothConfig,
  sort: sortConfig,
});

export type sceneName = keyof ReturnType<typeof scenes>;
