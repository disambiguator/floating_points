import React, { useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { ContainerProps } from 'react-three-fiber/targets/shared/web/ResizeContainer';
import { Controls } from 'react-three-gui';

// Make OrbitControls known as <orbitControls />
extend({ OrbitControls });

function SControls() {
  const ref = useRef<OrbitControls>();
  const { camera, gl } = useThree();
  useFrame(() => ref.current!.update());
  // @ts-ignore
  return <orbitControls ref={ref} args={[camera, gl.domElement]} />;
}
export const FiberScene = (props: ContainerProps & { controls?: boolean }) => {
  const { controls, ...rest } = props;
  return (
    <Controls.Provider>
      <Controls.Canvas {...rest}>
        {controls && <SControls />}
        {props.children}
      </Controls.Canvas>
      <Controls />
    </Controls.Provider>
  );
};
