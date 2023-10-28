/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 --types public/ghost.glb
Author: nessafrye (https://sketchfab.com/nessafrye)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/spooky-ghost-072da1663fc74b508d04b66932aee8a9
Title: Spooky Ghost
*/

import { useGLTF } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import assetUrl from 'lib/assetUrl';
import { forwardModelRef } from './helpers';

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh;
  };
  materials: {
    ['Scene_-_Root']: THREE.MeshStandardMaterial;
  };
};

export default forwardModelRef(function Ghost(props, ref) {
  const { nodes, materials } = useGLTF(assetUrl('/ghost.glb')) as GLTFResult;
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh
        geometry={nodes.Object_2.geometry}
        material={materials['Scene_-_Root']}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {props.children}
      </mesh>
    </group>
  );
});

useGLTF.preload(assetUrl('/ghost.glb'));
