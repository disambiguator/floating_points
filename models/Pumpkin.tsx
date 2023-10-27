import { useGLTF } from '@react-three/drei';
import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import assetUrl from 'lib/assetUrl';

type GLTFResult = GLTF & {
  nodes: {
    Halloween_Pumpkin: THREE.Mesh;
  };
};

export default forwardRef<
  THREE.Group<THREE.Object3DEventMap>,
  JSX.IntrinsicElements['group']
>(function Pumpkin(props, ref) {
  const { nodes } = useGLTF(assetUrl('/pumpkin.glb')) as GLTFResult;
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh
        geometry={nodes.Halloween_Pumpkin.geometry}
        material={nodes.Halloween_Pumpkin.material}
      >
        {props.children}
      </mesh>
    </group>
  );
});

useGLTF.preload('/pumpkin.glb');
