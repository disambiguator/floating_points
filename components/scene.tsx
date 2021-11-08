import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Props } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import React from 'react';

export const FiberScene = ({
  controls,
  children,
  ...rest
}: Props & { controls?: boolean }) => {
  return (
    <>
      <Canvas mode="concurrent" {...rest}>
        {controls && <OrbitControls />}
        {children}
      </Canvas>
    </>
  );
};
