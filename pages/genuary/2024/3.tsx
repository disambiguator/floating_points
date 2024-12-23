import { Box, Sphere, useFBO } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import { Orbits } from 'components/orbits';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import { rand } from 'lib/helpers';

const seeds = new Array(30).fill(undefined).map(() => {
  return {
    radius: rand(100, 200),
    theta: 2 * Math.PI * Math.random(),
    phi: 2 * Math.PI * Math.random(),
    thetaSpeed: (1 / 3) * Math.random(),
    // thetaSpeed: 0,
    // phiSpeed: 2 * Math.random(),
    phiSpeed: 0,
  };
});

const orbSeeds = new Array(20).fill(undefined).map(() => {
  return {
    radius: rand(50, 300),
    theta: 2 * Math.PI * Math.random(),
    phi: 2 * Math.PI * Math.random(),
    thetaSpeed: 2 * Math.random(),
    // thetaSpeed: 0,
    // phiSpeed: 2 * Math.random(),
    phiSpeed: 0,
  };
});

export const Shapes = React.memo(function Shapes() {
  const screenCopy1 = useFBO();
  const screenCopy2 = useFBO();
  const material = new THREE.MeshBasicMaterial();
  //   const rendererRef = React.useRef(null);

  let i = 0;
  useFrame((state) => {
    // state.scene.background = new THREE.Color('pink');

    const renderer = state.gl;
    // const { renderer } = rendererRef.current;
    material.map = i % 2 === 0 ? screenCopy2.texture : screenCopy1.texture;
    renderer.setRenderTarget(i % 2 === 0 ? screenCopy1 : screenCopy2);
    renderer.render(state.scene, state.camera);

    renderer.setRenderTarget(null);
    i++;
  });

  return (
    <>
      {seeds.map((s, i) => {
        const size = rand(50, 100);
        return (
          <Orbits key={i} seed={s}>
            <Box args={[size, size, size]} material={material} />
          </Orbits>
        );
      })}
      {orbSeeds.map((s, i) => (
        <Orbits key={i} seed={s}>
          <Sphere args={[20, 20, 20]}>
            <meshBasicMaterial
              color={
                // 'green'
                new THREE.Color(Math.random(), Math.random(), Math.random())
              }
            />
          </Sphere>
        </Orbits>
      ))}
    </>
  );
});

export default function Scene() {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene
          controls
          camera={{ far: 1000, near: 10, position: [0, 0, 100] }}
        >
          <Shapes />
        </FiberScene>
      </div>
    </Page>
  );
}
