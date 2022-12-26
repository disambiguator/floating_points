import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useRef } from 'react';
import * as THREE from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import fragmentShader from './17.frag';
import vertexShader from './17.vert';

const Shader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    posScale: new THREE.Uniform(0),
    striations: new THREE.Uniform(0),
    time: new THREE.Uniform(0),
    height: new THREE.Uniform(0),
  },
};

const Scene = React.memo(function Scene() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { posScale, striations, height } = useControls({
    posScale: { value: 30, min: 0, max: 60 },
    striations: { value: 30, min: 0, max: 50 },
    height: { value: 30, min: 0, max: 200 },
  });
  useFrame(({ clock }) => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 1000, 1000]} />
        <shaderMaterial
          ref={ref}
          args={[Shader]}
          side={THREE.DoubleSide}
          uniforms-posScale-value={posScale}
          uniforms-striations-value={striations}
          uniforms-height-value={height}
        />
      </mesh>
    </>
  );
});

export default function Fifteen() {
  return (
    <Page>
      <FiberScene frameloop="demand" controls camera={{ position: [0, 90, 0] }}>
        <Scene />
      </FiberScene>
    </Page>
  );
}
