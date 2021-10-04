import { ShaderMaterialParameters } from 'three';
import DusenShader from 'lib/shaders/dusen';
import FbmShader from 'lib/shaders/fbm';
import MarbleShader from 'lib/shaders/marble';
import StarkShader from 'lib/shaders/stark';
import { barsConfig } from 'scenes/bars';
import { clothConfig } from 'scenes/cloth';
import { controlConfig } from 'scenes/control';
import { cubefieldConfig } from 'scenes/cubefield';
import { dusenConfig } from 'scenes/dusen';
import { fbmConfig } from 'scenes/fbm';
import { chaosConfig } from 'scenes/geometric_chaos';
import { sortConfig } from 'scenes/sort';
import { spiroConfig } from 'scenes/spiro';

export const shaders: Record<string, ShaderMaterialParameters> = {
  fbm: FbmShader,
  dusen: DusenShader,
  marble: MarbleShader,
  stark: StarkShader,
};

export const scenes = {
  spiro: spiroConfig,
  bars: barsConfig,
  dusen: dusenConfig,
  cubefield: cubefieldConfig,
  control: controlConfig,
  chaos: chaosConfig,
  cloth: clothConfig,
  fbm: fbmConfig,
  sort: sortConfig,
};

export type sceneName = keyof typeof scenes;
