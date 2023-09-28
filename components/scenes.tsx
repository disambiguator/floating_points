import DusenShader from 'lib/shaders/dusen';
import FbmShader from 'lib/shaders/fbm';
import MarbleShader from 'lib/shaders/marble';
import StarkShader from 'lib/shaders/stark';
import { barsConfig } from 'scenes/bars';
import { clothConfig } from 'scenes/cloth';
import { controlConfig } from 'scenes/control';
import { cubefieldConfig } from 'scenes/cubefield';
import { dusenConfig } from 'scenes/dusen';
import { fadeConfig } from 'scenes/fade';
import { fbmConfig } from 'scenes/fbm';
import { chaosConfig } from 'scenes/geometric_chaos';
import { halloweenConfig } from 'scenes/halloween';
import { landscapeConfig } from 'scenes/landscape';
import { marbleConfig } from 'scenes/marble';
import { spiroConfig } from 'scenes/spiro';
import { webcamConfig } from 'scenes/webcam';

export const shaders = {
  fbm: FbmShader,
  dusen: DusenShader,
  marble: MarbleShader,
  stark: StarkShader,
};

export const scenes = {
  spiro: spiroConfig,
  dusen: dusenConfig,
  chaos: chaosConfig,
  landscape: landscapeConfig,
  bars: barsConfig,
  cubefield: cubefieldConfig,
  control: controlConfig,
  cloth: clothConfig,
  fbm: fbmConfig,
  marble: marbleConfig,
  webcam: webcamConfig,
  halloween: halloweenConfig,
  fireworks: fadeConfig,
};

export const sceneNames = Object.keys(scenes);

export type SceneName = keyof typeof scenes;
