import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Props } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { Leva } from 'leva';
import React from 'react';

export const FiberScene = ({
  controls,
  gui,
  children,
  ...rest
}: Props & { controls?: boolean; gui?: boolean }) => {
  return (
    <>
      {gui && <Leva />}
      <Canvas mode="concurrent" {...rest}>
        {controls && <OrbitControls />}
        {children}
      </Canvas>
    </>
  );
};
