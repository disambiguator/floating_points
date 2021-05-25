import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Props } from '@react-three/fiber/dist/declarations/src/web/Canvas';
import { Leva } from 'leva';
import React from 'react';
import { useIsMobile } from '../lib/mediaQueries';

export const FiberScene = ({
  controls,
  gui,
  children,
  ...rest
}: Props & { controls?: boolean; gui?: boolean }) => {
  const isMobile = useIsMobile();

  return (
    <>
      <Canvas mode="concurrent" {...rest}>
        {controls && <OrbitControls />}
        {children}
      </Canvas>
      {gui && (
        <Leva
          hideCopyButton
          collapsed={isMobile}
          fill={isMobile}
          titleBar={{ title: 'Controls', filter: false }}
        />
      )}
    </>
  );
};
