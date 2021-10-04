import { Effects as DreiEffects } from '@react-three/drei';
import {
  ReactThreeFiber,
  extend,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect, useRef } from 'react';
import { Vector2 } from 'three';
import { AfterimagePass } from 'three-stdlib';
import shallow from 'zustand/shallow';
import { scaleMidi } from '../lib/midi';
import TunnelShader from '../lib/shaders/tunnel';
import { Config, CustomEffectsType, State, useStore } from '../lib/store';

extend({ AfterimagePass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
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
  const { mouse, clock, viewport } = useThree();
  const { size } = useThree();
  const { xSpeed, ySpeed } = useControls({
    xSpeed: { value: 64, min: 0, max: 127, label: 'X Speed' },
    ySpeed: { value: 64, min: 0, max: 127, label: 'Y Speed' },
  });

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
      (bitcrush: number) => {
        afterimagePassRef.current!.uniforms.bitcrush.value = bitcrush;
      },
      (state) => state.bitcrush,
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
    uniforms.mouse.value = new Vector2(mouse.x * viewport.aspect, mouse.y);
    uniforms.time.value = clock.getElapsedTime();
  });

  const { bitcrush } = useStore.getState();

  return (
    <afterimagePass
      ref={afterimagePassRef}
      attachArray="passes"
      args={[0.96, TunnelShader]}
      uniforms-xspeed-value={scaleMidi(xSpeed, -1, 1, true)}
      uniforms-aspect-value={viewport.aspect}
      uniforms-yspeed-value={scaleMidi(ySpeed, -1, 1, true)}
      uniforms-bitcrush-value={bitcrush}
      uniforms-resolution-value={new Vector2(
        size.width,
        size.height,
      ).multiplyScalar(window.devicePixelRatio)}
    />
  );
};

export const Effects = <T,>({
  params,
  CustomEffects,
}: {
  name: Config<T>['name'];
  params: T;
  CustomEffects: CustomEffectsType<T> | undefined;
}) => (
  <DreiEffects>
    <TunnelEffects />
    {CustomEffects && <CustomEffects params={params} />}
  </DreiEffects>
);
