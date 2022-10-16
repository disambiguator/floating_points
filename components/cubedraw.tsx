import { type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import Page from './page';
import { FiberScene } from './scene';

export type BoxData = {
  position: [number, number, number];
  color: number;
  rotation: [number, number, number];
  creationTime: number;
};
const Box = ({ position, color, rotation, creationTime }: BoxData) => {
  const meshRef = useRef<THREE.Mesh<THREE.BoxGeometry>>();
  useFrame(({ clock }) => {
    const mesh = meshRef.current!;
    const factor = Math.sin(creationTime + clock.elapsedTime / 3);
    mesh.scale.set(factor, factor, factor);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[100, 100, 100]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
};

// const newPosition = () => ({
//   velocity: new THREE.Vector3(0, rand(-60, 0), 0),
//   position: new THREE.Vector3(rand(-5000, 5000), TOP, rand(-5000, 5000)),
//   acceleration: new THREE.Vector3(0, rand(-1, -0.1), 0),
// });

const CubeDraw = () => {
  const [boxes, setBoxes] = useState<JSX.Element[]>([]);
  const clock = useThree((t) => t.clock);
  const addCube = (e: ThreeEvent<PointerEvent>) => {
    const intersection = e.intersections[0].point.toArray() as [
      number,
      number,
      number,
    ];
    const newBox = (
      <Box
        key={boxes.length}
        position={intersection}
        color={Math.random() * 0xffffff}
        rotation={[
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ]}
        creationTime={clock.elapsedTime}
      />
    );
    setBoxes([...boxes, newBox]);
  };

  return (
    <>
      <mesh onPointerMove={addCube} position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>
      {boxes}
      <pointLight position={[1000, 100, 1000]} />
    </>
  );
};

export default function CubeDrawPage() {
  return (
    <Page>
      <FiberScene
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 300], far: 10000 }}
      >
        <CubeDraw />
      </FiberScene>
    </Page>
  );
}
