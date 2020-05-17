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
import { KaleidoscopeShader } from '../lib/shaders/kaleidoscope';
import { scaleMidi, Config } from './mixer';

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

export const Effects = ({ config }: { config: Config }) => {
  const { gl, scene, camera, size, aspect } = useThree();
  const composer = useRef<EffectComposer>();
  const { trails } = config;

  useEffect(() => {
    composer.current!.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    composer.current!.render();
  }, 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <afterimagePass
        attachArray="passes"
        uniforms-damp-value={scaleMidi(trails, 0, 1)}
        uniforms-zoom-value={scaleMidi(config.zoomThreshold, 0, 0.3)}
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
