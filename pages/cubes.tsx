import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from 'react-three-fiber';
import Page from '../components/page';
import * as THREE from 'three';
import { FiberScene } from '../components/scene';

const Cube = ({
  sideLength,
  position,
  rotation,
}: {
  sideLength: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const boxGeometry = useRef<THREE.BufferGeometry>();
  const colors = useMemo(() => {
    const d = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) {
      d[i * 3] = Math.random();
      d[i * 3 + 1] = Math.random();
      d[i * 3 + 2] = Math.random();
    }

    return d;
  }, []);

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry
        ref={boxGeometry}
        args={[sideLength, sideLength, sideLength]}
      >
        <bufferAttribute
          attachObject={['attributes', 'color']}
          count={24}
          array={colors}
          itemSize={3}
        />
      </boxGeometry>
      <meshBasicMaterial color={0xffffff} vertexColors />
    </mesh>
  );
};

const Cubes = () => {
  const [timer, setTimer] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState(0);

  const greenLength = 100;
  const yellowLength = 500;
  const redLength = 2500;

  const redPosition: [number, number, number] = [
    0,
    0,
    -(
      2 * greenLength * Math.sin(Math.PI / 4) +
      2 * yellowLength * Math.sin(Math.PI / 4) +
      redLength * Math.sin(Math.PI / 4)
    ),
  ];

  const yellowPosition: [number, number, number] = [
    0,
    0,
    -(
      2 * greenLength * Math.sin(Math.PI / 4) +
      yellowLength * Math.sin(Math.PI / 4)
    ),
  ];

  useFrame(() => {
    setTimer(timer + 1);

    if (timer % 32 === 0) {
      setIsRotating(!isRotating);
    }

    if (isRotating) {
      setRotation(rotation + Math.PI / 64);
    }
  });

  return (
    <>
      <Cube
        sideLength={redLength}
        position={redPosition}
        rotation={[0, 0, rotation]}
      />
      <Cube sideLength={greenLength} rotation={[0, rotation, 0]} />
      <Cube
        sideLength={yellowLength}
        position={yellowPosition}
        rotation={[rotation, 0, 0]}
      />
    </>
  );
};

export default function CubesPage() {
  return (
    <Page>
      <div style={{ height: 400, width: 400 }}>
        <FiberScene
          camera={{
            far: 10000,
            position: [0, 0, 300],
          }}
          controls
        >
          <Cubes />
        </FiberScene>
      </div>
    </Page>
  );
}
