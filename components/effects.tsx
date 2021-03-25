import { Effects as DreiEffects } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import { ReactThreeFiber, extend, useFrame, useThree } from 'react-three-fiber';
import { Vector2 } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import shallow from 'zustand/shallow';
import { scaleMidi } from '../lib/midi';
import TunnelShader from '../lib/shaders/tunnel';
import { Config, CustomEffectsType, State, useStore } from '../lib/store';
import { AfterimagePass } from './AfterimagePass';
import { useMidiControl } from './mixer';
extend({ RenderPass, AfterimagePass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      afterimagePass: ReactThreeFiber.Node<
        AfterimagePass<any>,
        typeof AfterimagePass
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const TunnelEffects = () => {
  const afterimagePassRef = useRef<AfterimagePass<typeof TunnelShader>>();
  const { mouse, clock, aspect } = useThree();
  const xSpeed = useMidiControl('X Speed', { value: 64 });
  const ySpeed = useMidiControl('Y Speed', { value: 64 });

  useEffect(() => {
    const pass = afterimagePassRef.current!;

    const updateZoom = (trails: number) => {
      pass.uniforms.damp.value = scaleMidi(trails, 0.8, 1);
      pass.uniforms.zoomDamp.value = scaleMidi(trails, 0, 1);
    };

    const zoomStateSelector = (state: State) => state.trails;

    updateZoom(zoomStateSelector(useStore.getState()));

    return useStore.subscribe(updateZoom, zoomStateSelector);
  }, []);

  useEffect(() => {
    return useStore.subscribe(
      (kaleidoscope: number) => {
        afterimagePassRef.current!.uniforms.numSides.value = kaleidoscope;
      },
      (state) => state.kaleidoscope,
    );
  }, []);

  useEffect(() => {
    return useStore.subscribe(
      (angle: number) => {
        afterimagePassRef.current!.uniforms.angle.value = scaleMidi(
          angle,
          -Math.PI / 10,
          Math.PI / 10,
          true,
        );
      },
      (state) => state.angle,
    );
  }, []);

  useEffect(() => {
    const updateThreshold = ([zoomThreshold, name]: [number, string]) => {
      afterimagePassRef.current!.uniforms.zoom.value = [
        'bars',
        'cloth',
      ].includes(name)
        ? 0
        : scaleMidi(zoomThreshold, 0, 0.3);
      console.log(afterimagePassRef.current!.uniforms.zoomDamp.value);
    };

    const zoomStateSelector = (state: State): [number, string] => [
      state.zoomThreshold,
      state.env!.name,
    ];

    updateThreshold(zoomStateSelector(useStore.getState()));

    return useStore.subscribe(updateThreshold, zoomStateSelector, shallow);
  }, []);

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
      uniforms-xspeed-value={scaleMidi(xSpeed, -1, 1, true)}
      uniforms-aspect-value={aspect}
      uniforms-yspeed-value={scaleMidi(ySpeed, -1, 1, true)}
    />
  );
};

export const Effects = <T,>({
  params,
  CustomEffects,
}: {
  name: Config<T>['name'];
  params: T;
  CustomEffects?: CustomEffectsType<T>;
}) => {
  return (
    <DreiEffects>
      <TunnelEffects />
      {CustomEffects && <CustomEffects params={params} />}
    </DreiEffects>
  );
};
