/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 --types public/bat.glb
Author: Dzimge (https://sketchfab.com/Dzimge)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/bat-8719886cf8f645ca9d53d766976baf9c
Title: Bat
*/

import { useAnimations, useGLTF } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { forwardModelRef } from './helpers';

type ActionName = 'ArmatureAction';
type GLTFAction = {
  name: ActionName;
} & THREE.AnimationClip;

type GLTFResult = GLTF & {
  nodes: {
    body_mesh_Cylinder_0: THREE.SkinnedMesh;
    wing_mesh_Plane_0: THREE.SkinnedMesh;
    Sphere_0: THREE.SkinnedMesh;
    hair_0: THREE.SkinnedMesh;
    Armature_rootJoint: THREE.Bone;
  };
  materials: {
    ['Material.001']: THREE.MeshStandardMaterial;
    eyes: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export default forwardModelRef(function Bat(props, ref) {
  const group = useRef<THREE.Group>();
  const { nodes, materials, animations } = useGLTF('/bat.glb') as GLTFResult;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions.ArmatureAction?.play();
  }, [actions]);

  return (
    <group ref={mergeRefs([group, ref])} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group
          name="Sketchfab_model"
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.098}
        >
          <group name="Root">
            <group name="Armature">
              <primitive object={nodes.Armature_rootJoint} />
              <group name="body_mesh_Cylinder" />
              <group name="wing_mesh_Plane" />
              <group name="Sphere" position={[3.003, 0, 0.174]} />
              <group name="hair" />
              <skinnedMesh
                name="body_mesh_Cylinder_0"
                geometry={nodes.body_mesh_Cylinder_0.geometry}
                material={materials['Material.001']}
                skeleton={nodes.body_mesh_Cylinder_0.skeleton}
              >
                {props.children}
              </skinnedMesh>
              <skinnedMesh
                name="wing_mesh_Plane_0"
                geometry={nodes.wing_mesh_Plane_0.geometry}
                material={materials['Material.001']}
                skeleton={nodes.wing_mesh_Plane_0.skeleton}
              >
                {props.children}
              </skinnedMesh>
              <skinnedMesh
                name="Sphere_0"
                geometry={nodes.Sphere_0.geometry}
                material={materials.eyes}
                skeleton={nodes.Sphere_0.skeleton}
              >
                {props.children}
              </skinnedMesh>
              <skinnedMesh
                name="hair_0"
                geometry={nodes.hair_0.geometry}
                material={materials['Material.001']}
                skeleton={nodes.hair_0.skeleton}
              >
                {props.children}
              </skinnedMesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

useGLTF.preload('/bat.glb');