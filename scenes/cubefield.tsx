import { useFrame } from '@react-three/fiber';
import type { BoxData } from 'pages/cubedraw';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import type { Config } from '../lib/store';

const Box = ({ position, color, rotation, creationTime }: BoxData) => {
  const meshRef = useRef<THREE.Mesh<THREE.BoxGeometry>>(null);
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const factor = Math.sin(creationTime + clock.elapsedTime);
    mesh.scale.set(factor, factor, factor);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[100, 100, 100]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
};

export const CubeField = () => {
  const [boxes, setBoxes] = useState<JSX.Element[]>([]);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock, camera }, delta) => {
    lightRef.current!.translateZ(-delta * 500);
    camera.translateZ(-delta * 500);
    const newBoxes = [...boxes];
    const x = 200 * Math.cos((3 * clock.elapsedTime) % (Math.PI * 2));
    const y = 200 * Math.sin((3 * clock.elapsedTime) % (Math.PI * 2));
    const i = Math.floor(clock.elapsedTime * 100) % 300;
    newBoxes[i] = (
      <Box
        key={i}
        position={[x, y, camera.position.z - 1000]}
        color={Math.random() * 0xffffff}
        rotation={[
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ]}
        creationTime={-clock.elapsedTime}
      />
    );

    setBoxes(newBoxes);
  }, 0);

  return (
    <>
      {boxes}
      <ambientLight intensity={0.5} />
      <pointLight ref={lightRef} position={[0, 0, 100]} intensity={100000} />
    </>
  );
};

export const cubefieldConfig: Config = {
  name: 'cubefield',
  Contents: CubeField,
};
