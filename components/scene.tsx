import { OrbitControls } from '@react-three/drei';
import React from 'react';
import { ContainerProps } from 'react-three-fiber/targets/shared/web/ResizeContainer';
import { Controls } from 'react-three-gui';

export const FiberScene = ({
  controls,
  gui,
  children,
  ...rest
}: ContainerProps & { controls?: boolean; gui?: boolean }) => (
  <Controls.Provider>
    <Controls.Canvas {...rest}>
      {controls && <OrbitControls />}
      {children}
    </Controls.Canvas>
    <Controls collapsed={false} style={gui ? undefined : { display: 'none' }} />
  </Controls.Provider>
);
