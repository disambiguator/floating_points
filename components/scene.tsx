import React, { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { ContainerProps } from 'react-three-fiber/targets/shared/web/ResizeContainer';

type Props = {
  renderer: THREE.WebGLRenderer;
  renderScene: () => void;
  orbitControls?: boolean;
  camera: THREE.Camera;
  shapes: Array<THREE.Mesh | THREE.Line>;
  effects?: Array<Pass>;
};

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
