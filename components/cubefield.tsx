import React, { useRef, useState } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { useStateUpdate } from '../lib/store';
import { BoxData } from './cubedraw';
import MixerPage from './mixer';

const Box = ({ position, color, rotation, creationTime }: BoxData) => {
  const meshRef = useRef<THREE.Mesh<THREE.BoxGeometry>>();
  const { clock } = useThree();
  useFrame(() => {
    const mesh = meshRef.current!;
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
  const { clock, camera } = useThree();

  useFrame(() => {
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

export const cubefieldConfig = {
  name: 'cubefield' as const,
  Contents: CubeField,
  params: {},
};

export default function DusenPage() {
  useStateUpdate({ env: cubefieldConfig });

  return <MixerPage />;
}
