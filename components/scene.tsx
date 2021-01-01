import React from 'react';
import { ContainerProps } from 'react-three-fiber/targets/shared/web/ResizeContainer';
import { Controls } from 'react-three-gui';
import { OrbitControls } from '@react-three/drei/OrbitControls';

export const FiberScene = (props: ContainerProps & { controls?: boolean }) => {
  const { controls, ...rest } = props;
  return (
    <Controls.Provider>
      <Controls.Canvas {...rest}>
        {controls && <OrbitControls />}
        {props.children}
      </Controls.Canvas>
      <Controls />
    </Controls.Provider>
  );
};
