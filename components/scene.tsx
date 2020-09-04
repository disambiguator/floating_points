import React, { useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { ContainerProps } from 'react-three-fiber/targets/shared/web/ResizeContainer';

// Make OrbitControls known as <orbitControls />
extend({ OrbitControls });

function Controls() {
  const ref = useRef<OrbitControls>();
  const { camera, gl } = useThree();
  useFrame(() => ref.current!.update());
  // @ts-ignore
  return <orbitControls ref={ref} args={[camera, gl.domElement]} />;
}
export const FiberScene = (props: ContainerProps & { controls?: boolean }) => {
  const { controls, ...rest } = props;
  return (
    <Canvas {...rest}>
      {controls && <Controls />}
      {props.children}
    </Canvas>
  );
};
