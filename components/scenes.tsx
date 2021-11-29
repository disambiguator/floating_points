import { ShaderMaterialParameters } from 'three';
import DusenShader from 'lib/shaders/dusen';
import FbmShader from 'lib/shaders/fbm';
import MarbleShader from 'lib/shaders/marble';
import StarkShader from 'lib/shaders/stark';
import { Config } from 'lib/store';
import { barsConfig } from 'scenes/bars';
import { clothConfig } from 'scenes/cloth';
import { controlConfig } from 'scenes/control';
import { cubefieldConfig } from 'scenes/cubefield';
import { dusenConfig } from 'scenes/dusen';
import { fbmConfig } from 'scenes/fbm';
import { chaosConfig } from 'scenes/geometric_chaos';
import { marbleConfig } from 'scenes/marble';
import { spiroConfig } from 'scenes/spiro';
import { webcamConfig } from 'scenes/webcam';

export const shaders: Record<string, ShaderMaterialParameters> = {
  fbm: FbmShader,
  dusen: DusenShader,
  marble: MarbleShader,
  stark: StarkShader,
};

export const scenes: Record<string, Config> = {
  spiro: spiroConfig,
  bars: barsConfig,
  dusen: dusenConfig,
  cubefield: cubefieldConfig,
  control: controlConfig,
  chaos: chaosConfig,
  cloth: clothConfig,
  fbm: fbmConfig,
  marble: marbleConfig,
  webcam: webcamConfig,
};

export type sceneName = keyof typeof scenes;
