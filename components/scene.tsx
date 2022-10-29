import { OrbitControls } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import React from 'react';

export const FiberScene = ({
  controls,
  children,
  ...rest
}: Props & { controls?: boolean }) => {
  return (
    <Canvas mode="concurrent" {...rest}>
      {controls && <OrbitControls />}
      {children}
    </Canvas>
  );
};
