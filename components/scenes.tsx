import { ShaderMaterialParameters } from 'three';
import DusenShader from '../lib/shaders/dusen';
import FbmShader from '../lib/shaders/fbm';
import MarbleShader from '../lib/shaders/marble';
import StarkShader from '../lib/shaders/stark';
import { barsConfig } from '../pages/bars';
import { clothConfig } from '../pages/cloth';
import { cubefieldConfig } from '../pages/cubefield';
import { dusenConfig } from '../pages/dusen';
import { spiroConfig } from '../pages/spiro';
import { chaosConfig } from './geometric_chaos';
import { sortConfig } from './sort';

export const shaders: Record<string, ShaderMaterialParameters> = {
  fbm: FbmShader,
  dusen: DusenShader,
  marble: MarbleShader,
  stark: StarkShader,
};

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
