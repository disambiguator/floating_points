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
import ZoomShader from '../lib/shaders/zoom';
import React, { useRef, useEffect } from 'react';
import { KaleidoscopeShader } from '../lib/shaders/kaleidoscope';
import {
  BaseConfig,
  CustomEffectsType,
  scaleMidi,
  useMidiControl,
} from './mixer';
import TunnelShader from '../lib/shaders/tunnel';
import { Vector2 } from 'three';

extend({ EffectComposer, ShaderPass, RenderPass, AfterimagePass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      effectComposer: ReactThreeFiber.Node<
        EffectComposer,
        typeof EffectComposer
      >;
      renderPass: ReactThreeFiber.Node<RenderPass, typeof RenderPass>;
      shaderPass: ReactThreeFiber.Node<ShaderPass, typeof ShaderPass>;
      afterimagePass: ReactThreeFiber.Node<
        AfterimagePass,
        typeof AfterimagePass
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const TunnelEffects = ({ params }: { params: BaseConfig }) => {
  const afterimagePassRef = useRef<AfterimagePass>();
  const { mouse, clock, aspect } = useThree();
  const xSpeed = useMidiControl('X Speed', { value: 64 });
  const ySpeed = useMidiControl('Y Speed', { value: 64 });

  useFrame(() => {
    const uniforms = afterimagePassRef.current!
      .uniforms as typeof TunnelShader['uniforms'];
    uniforms.mouse.value = new Vector2(mouse.x * aspect, mouse.y);
    uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <afterimagePass
      ref={afterimagePassRef}
      attachArray="passes"
      args={[TunnelShader]}
      uniforms-damp-value={scaleMidi(params.trails, 0.8, 1)}
      uniforms-angle-value={scaleMidi(
        params.angle,
        -Math.PI / 10,
        Math.PI / 10,
        true,
      )}
      uniforms-xspeed-value={scaleMidi(xSpeed, -1, 1, true)}
      uniforms-aspect-value={aspect}
      uniforms-yspeed-value={scaleMidi(ySpeed, -1, 1, true)}
    />
  );
};

export const Effects = <T extends BaseConfig>({
  params,
  CustomEffects,
}: {
  params: T;
  CustomEffects?: CustomEffectsType<T>;
}) => {
  const { gl, scene, camera, size, aspect } = useThree();
  const composer = useRef<EffectComposer>();

  useEffect(() => {
    composer.current!.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    composer.current!.render();
  }, 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      {!['bars', 'cloth'].includes(params.name) && (
        <afterimagePass
          attachArray="passes"
          args={[ZoomShader]}
          uniforms-damp-value={scaleMidi(params.trails, 0, 1)}
          uniforms-zoom-value={scaleMidi(params.zoomThreshold, 0, 0.3)}
        />
      )}
      {<TunnelEffects params={params} />}
      {params.kaleidoscope !== 0 ? (
        <shaderPass
          attachArray="passes"
          args={[KaleidoscopeShader]}
          uniforms-aspect-value={aspect}
          uniforms-numSides-value={params.kaleidoscope}
        />
      ) : null}
      {CustomEffects && <CustomEffects params={params} />}
    </effectComposer>
  );
};
