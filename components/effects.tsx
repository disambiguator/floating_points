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
import {
  Config,
  CustomEffectsType,
  State,
  angleSelector,
  bitcrushSelector,
  kaleidoscopeSelector,
  trailsSelector,
  useStore,
} from '../lib/store';

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
  const viewport = useThree((three) => three.viewport);
  const size = useThree((three) => three.size);
  useControls(() => ({
    xSpeed: {
      value: 64,
      min: 0,
      max: 127,
      label: 'X Speed',
      onChange: (xSpeed) => {
        afterimagePassRef.current!.uniforms.xspeed.value = scaleMidi(
          xSpeed,
          -1,
          1,
          true,
        );
      },
    },
    ySpeed: {
      value: 64,
      min: 0,
      max: 127,
      label: 'Y Speed',
      onChange: (ySpeed) => {
        afterimagePassRef.current!.uniforms.yspeed.value = scaleMidi(
          ySpeed,
          -1,
          1,
          true,
        );
      },
    },
  }));

  useEffect(() => {
    const updateZoom = (trails: number) => {
      const pass = afterimagePassRef.current!;
      pass.uniforms.damp.value = scaleMidi(trails, 0.8, 1);
      pass.uniforms.zoomDamp.value = scaleMidi(trails, 0, 1);
    };
    updateZoom(trailsSelector(useStore.getState()));

    return useStore.subscribe(trailsSelector, updateZoom);
  }, []);

  useEffect(() => {
    return useStore.subscribe(kaleidoscopeSelector, (kaleidoscope: number) => {
      afterimagePassRef.current!.uniforms.numSides.value = kaleidoscope;
    });
  }, []);

  useEffect(() => {
    return useStore.subscribe(bitcrushSelector, (bitcrush: number) => {
      afterimagePassRef.current!.uniforms.bitcrush.value = bitcrush;
    });
  }, []);

  useEffect(() => {
    return useStore.subscribe(angleSelector, (angle: number) => {
      afterimagePassRef.current!.uniforms.angle.value = scaleMidi(
        angle,
        -Math.PI / 10,
        Math.PI / 10,
        true,
      );
    });
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

    return useStore.subscribe(zoomStateSelector, updateThreshold, {
      equalityFn: shallow,
    });
  }, []);

  useFrame(({ mouse, clock }) => {
    const uniforms = afterimagePassRef.current!
      .uniforms as typeof TunnelShader['uniforms'];
    uniforms.mouse.value = new Vector2(mouse.x * viewport.aspect, mouse.y);
    uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <afterimagePass
      ref={afterimagePassRef}
      attachArray="passes"
      args={[0.96, TunnelShader]}
      uniforms-aspect-value={viewport.aspect}
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
