import { useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import type { BoxData } from '../components/cubedraw';
import type { Config } from '../lib/store';

const Box = ({ position, color, rotation, creationTime }: BoxData) => {
  const meshRef = useRef<THREE.Mesh<THREE.BoxGeometry>>();
  useFrame(({ clock }) => {
    const mesh = meshRef.current!;
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

  useFrame(({ clock, camera }) => {
    camera.translateOnAxis(new THREE.Vector3(0, 0, -1), 10);
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
      <pointLight position={[1000, 100, 1000]} />
    </>
  );
};

export const cubefieldConfig: Config = {
  name: 'cubefield',
  Contents: CubeField,
  params: {},
};
