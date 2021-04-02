import { OrbitControls } from '@react-three/drei';
import { Leva } from 'leva';
import React from 'react';
import { Canvas, ContainerProps } from 'react-three-fiber';

export const FiberScene = ({
  controls,
  gui,
  children,
  ...rest
}: ContainerProps & { controls?: boolean; gui?: boolean }) => {
  return (
    <>
      {gui && <Leva />}
      <Canvas concurrent {...rest}>
        {controls && <OrbitControls />}
        {children}
      </Canvas>
    </>
  );
};
