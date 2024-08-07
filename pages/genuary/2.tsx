import { Effects, OrbitControls, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { JSX, useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import type { GLTF, OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import defaultForwardUV from 'lib/shaders/defaultForwardUV.vert';
import fragmentShader from './2.frag';

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: Rui Barbosa (https://sketchfab.com/ruibarbosa.art)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/male-face-f032638713f54e6bace311ae911bd663
title: Male Face
*/

type GLTFResult = GLTF & {
  nodes: {
    FirstMaleFaceTOOL_FirstMaleFaceTOOL_0: THREE.Mesh;
    FirstMaleFaceTOOL_FirstMaleFaceTOOL_0_1: THREE.Mesh;
  };
  materials: {
    FirstMaleFaceTOOL: THREE.MeshStandardMaterial;
  };
};

function Model(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF(
    '/male_face/scene.gltf',
  ) as unknown as GLTFResult;
  return (
    <group ref={group} position={[0, -1, 0]} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            material={materials.FirstMaleFaceTOOL}
            geometry={nodes.FirstMaleFaceTOOL_FirstMaleFaceTOOL_0.geometry}
          />
          <mesh
            material={materials.FirstMaleFaceTOOL}
            geometry={nodes.FirstMaleFaceTOOL_FirstMaleFaceTOOL_0_1.geometry}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/male_face/scene.gltf');

const Dither = () => ({
  uniforms: {
    tDiffuse: { value: null },
    threshold: { value: 0 },
    time: { value: 0 },
  },
  vertexShader: defaultForwardUV,
  fragmentShader,
});

export const Shapes = React.memo(function Shapes() {
  const gl = useThree((t) => t.gl);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const shader = useMemo(Dither, []);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    gl.setPixelRatio(0.4);
  }, [gl]);

  useFrame(({ clock }) => {
    shader.uniforms.time.value = clock.elapsedTime;
    groupRef.current!.rotation.x = clock.elapsedTime / 2;
    groupRef.current!.rotation.z = clock.elapsedTime / 3;
  });

  const { threshold } = useControls({
    threshold: { value: 0, min: -0.5, max: 0.5 },
  });

  return (
    <>
      <OrbitControls ref={controlsRef} />
      <group ref={groupRef}>
        <pointLight position={[20, 100, 0]} intensity={100000} color="red" />
        <pointLight position={[-40, 10, 0]} intensity={100000} color="blue" />
        <pointLight position={[0, -100, 0]} intensity={100000} color="cyan" />
      </group>
      <React.Suspense fallback={null}>
        <Model />
      </React.Suspense>
      <Effects>
        <shaderPass args={[shader]} uniforms-threshold-value={threshold} />
      </Effects>
    </>
  );
});

export default function Scene() {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene camera={{ position: [0, 0, 1] }}>
          <Shapes />
        </FiberScene>
      </div>
    </Page>
  );
}
