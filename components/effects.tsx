import { Effects as DreiEffects } from '@react-three/drei';
import React, { useRef } from 'react';
import { ReactThreeFiber, extend, useFrame, useThree } from 'react-three-fiber';
import { Vector2 } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { scaleMidi } from '../lib/midi';
import { KaleidoscopeShader } from '../lib/shaders/kaleidoscope';
import TunnelShader from '../lib/shaders/tunnel';
import ZoomShader from '../lib/shaders/zoom';
import { Config, CustomEffectsType, useStore } from '../lib/store';
import { AfterimagePass } from './AfterimagePass';
import { useMidiControl } from './mixer';
extend({ ShaderPass, RenderPass, AfterimagePass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
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

const TunnelEffects = () => {
  const afterimagePassRef = useRef<AfterimagePass>();
  const { mouse, clock, aspect } = useThree();
  const xSpeed = useMidiControl('X Speed', { value: 64 });
  const ySpeed = useMidiControl('Y Speed', { value: 64 });

  useFrame(() => {
    const { trails, angle } = useStore.getState();

    const uniforms = afterimagePassRef.current!
      .uniforms as typeof TunnelShader['uniforms'];
    uniforms.mouse.value = new Vector2(mouse.x * aspect, mouse.y);
    uniforms.time.value = clock.getElapsedTime();
    uniforms.damp.value = scaleMidi(trails, 0.8, 1);
    uniforms.angle.value = scaleMidi(angle, -Math.PI / 10, Math.PI / 10, true);
  });

  return (
    <afterimagePass
      ref={afterimagePassRef}
      attachArray="passes"
      args={[TunnelShader]}
      uniforms-xspeed-value={scaleMidi(xSpeed, -1, 1, true)}
      uniforms-aspect-value={aspect}
      uniforms-yspeed-value={scaleMidi(ySpeed, -1, 1, true)}
    />
  );
};

export const Effects = <T,>({
  name,
  params,
  CustomEffects,
}: {
  name: Config<T>['name'];
  params: T;
  CustomEffects?: CustomEffectsType<T>;
}) => {
  const { scene, camera, aspect } = useThree();

  const zoomThreshold = useStore((state) => state.zoomThreshold);
  const trails = useStore((state) => state.trails);
  const kaleidoscope = useStore((state) => state.kaleidoscope);

  return (
    <DreiEffects>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      {!['bars', 'cloth'].includes(name) &&
        trails !== 0 &&
        zoomThreshold !== 0 && (
          <afterimagePass
            attachArray="passes"
            args={[ZoomShader]}
            uniforms-damp-value={scaleMidi(trails, 0, 1)}
            uniforms-zoom-value={scaleMidi(zoomThreshold, 0, 0.3)}
          />
        )}
      <TunnelEffects />
      {kaleidoscope !== 0 ? (
        <shaderPass
          attachArray="passes"
          args={[KaleidoscopeShader]}
          uniforms-aspect-value={aspect}
          uniforms-numSides-value={kaleidoscope}
        />
      ) : null}
      {CustomEffects && <CustomEffects params={params} />}
    </DreiEffects>
  );
};
