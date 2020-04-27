import {
  useThree,
  useFrame,
  extend,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ReactThreeFiber,
} from 'react-three-fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { AfterimagePass } from './AfterimagePass';
import React, { useRef, useState, useEffect } from 'react';
import { sum } from 'lodash';
import { KaleidoscopeShader } from '../lib/shaders/kaleidoscope';

extend({ EffectComposer, ShaderPass, RenderPass, AfterimagePass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      effectComposer: ReactThreeFiber.Object3DNode<
        EffectComposer,
        typeof EffectComposer
      >;
      renderPass: ReactThreeFiber.Object3DNode<RenderPass, typeof RenderPass>;
      shaderPass: ReactThreeFiber.Object3DNode<ShaderPass, typeof ShaderPass>;
      afterimagePass: ReactThreeFiber.Object3DNode<
        AfterimagePass,
        typeof AfterimagePass
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export interface Audio {
  analyser: THREE.AudioAnalyser;
  listener: THREE.AudioListener;
  stream: MediaStream;
}

export interface Config {
  color: boolean;
  zoomThreshold: number;
  pulseEnabled: boolean;
  audioEnabled: boolean;
  noiseAmplitude: number;
  trails: number;
  kaleidoscope: number;
}

export const Effects = ({
  config,
  audio,
}: {
  config: Config;
  audio?: Audio | undefined;
}) => {
  const { gl, scene, camera, size, aspect } = useThree();
  const composer = useRef<EffectComposer>();
  const [zoom, setZoom] = useState(config.zoomThreshold);
  const { trails } = config;

  useEffect(() => {
    composer.current!.setSize(size.width, size.height);
  }, [size]);

  useEffect(() => {
    if (!config.pulseEnabled && !config.audioEnabled) {
      setZoom(config.zoomThreshold);
    }
  }, [config.zoomThreshold]);

  useFrame(() => {
    if (config.pulseEnabled) {
      setZoom((zoom + 0.001) % config.zoomThreshold);
    } else if (config.audioEnabled && audio) {
      const { analyser } = audio;
      const freq = analyser.getFrequencyData();
      setZoom((sum(freq) * config.zoomThreshold) / 4000);
    }

    composer.current!.render();
  }, 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <afterimagePass
        attachArray="passes"
        uniforms-damp-value={trails}
        uniforms-zoom-value={zoom}
      />
      {config.kaleidoscope !== 0 ? (
        <shaderPass
          attachArray="passes"
          args={[KaleidoscopeShader]}
          uniforms-aspect-value={aspect}
          uniforms-numSides-value={config.kaleidoscope}
        />
      ) : null}
    </effectComposer>
  );
};
