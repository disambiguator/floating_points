import { useGLTF } from '@react-three/drei';
import React, { forwardRef, useRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    top: THREE.Mesh;
    bottom: THREE.Mesh;
  };
};

export default forwardRef<
  THREE.Group<THREE.Object3DEventMap>,
  JSX.IntrinsicElements['group']
>(function Skull(props, ref) {
  const { nodes } = useGLTF('/skull.glb') as GLTFResult;
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh geometry={nodes.top.geometry} material={nodes.top.material}>
        {props.children}
      </mesh>
      <mesh geometry={nodes.bottom.geometry} material={nodes.bottom.material}>
        {props.children}
      </mesh>
    </group>
  );
});

useGLTF.preload('/skull.glb');
