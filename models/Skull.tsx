import { useGLTF } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import assetUrl from 'lib/assetUrl';
import { forwardModelRef } from './helpers';

type GLTFResult = GLTF & {
  nodes: {
    top: THREE.Mesh;
    bottom: THREE.Mesh;
  };
};

export default forwardModelRef(function Skull(props, ref) {
  const { nodes } = useGLTF(assetUrl('/skull.glb')) as GLTFResult;
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

useGLTF.preload(assetUrl('/skull.glb'));
