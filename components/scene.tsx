import { OrbitControls } from '@react-three/drei';
import { Canvas, type Props } from '@react-three/fiber';
import React, { Suspense } from 'react';

export const FiberScene = ({
  controls,
  children,
  ...rest
}: Props & { controls?: boolean }) => {
  return (
    <Suspense fallback={null}>
      <Canvas mode="concurrent" {...rest}>
        {controls && <OrbitControls />}
        {children}
      </Canvas>
    </Suspense>
  );
};
