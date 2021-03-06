import { OrbitControls } from '@react-three/drei';
import React from 'react';
import { Canvas, ContainerProps } from 'react-three-fiber';
import { Controls } from 'react-three-gui';

export const FiberScene = ({
  controls,
  gui,
  children,
  ...rest
}: ContainerProps & { controls?: boolean; gui?: boolean }) => {
  return gui ? (
    <Controls.Provider>
      <Controls.Canvas {...rest}>
        {controls && <OrbitControls />}
        {children}
      </Controls.Canvas>
      <Controls collapsed={false} />
    </Controls.Provider>
  ) : (
    <Canvas {...rest}>
      {controls && <OrbitControls />}
      {children}
    </Canvas>
  );
};
