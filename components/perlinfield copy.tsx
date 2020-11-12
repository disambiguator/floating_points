import { OrbitControls, Sky } from 'drei';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import styled from 'styled-components';
import * as THREE from 'three';
import { makeNoise2D } from 'open-simplex-noise';
import { analyseSpectrum, useAudioUrl, useMicrophone } from '../lib/audio';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background: black;
`;

const length = 400;
const width = 400;
const zoom = 8;
const zoomX = zoom;
const zoomY = zoom;
const speed = 1;
const planeLength = 5000;
const planeWidth = 5000;
const t = 1;

const widthSpacing = planeWidth / width;
const lengthSpacing = planeLength / length;

const noiseFunction = makeNoise2D(Date.now());
const noise = (x: number, y: number) =>
  Math.min(noiseFunction((x * zoomX) / length, (y * zoomY) / width), 0.15) *
  400;

const vertices = (x: number, y: number) => [
  -planeWidth / 2 + x * widthSpacing,
  noise(x, y),
  -planeWidth / 2 + y * lengthSpacing,
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const newPosition = () =>
  new THREE.Vector3(rand(-3000, 3000), rand(-3000, 3000), rand(-3000, 3000));

const Stars = React.memo(function Stars() {
  const audio = useAudioUrl(
    'https://floating-points.s3.us-east-2.amazonaws.com/void.mp3',
  );

  const materialRef = useRef<THREE.PointsMaterial>();

  const vertices = useMemo(
    () => new Array(2000).fill(undefined).map(newPosition),
    [],
  );

  useFrame(() => {
    const size = audio ? Math.pow(analyseSpectrum(audio).volume / 10, 2) : 10;
    materialRef.current!.size = size;
  });

  return (
    <points position={[0, 0, -4]}>
      <geometry vertices={vertices} />
      <pointsMaterial
        ref={materialRef}
        args={[{ color: 0xffffff, size: 10 }]}
      />
    </points>
  );
});

const Row = ({ y, material }: { y: number; material: JSX.Element }) => {
  const meshRef = useRef<THREE.Mesh>();
  const geometryRef = useRef<THREE.BufferGeometry>();
  useEffect(() => {
    geometryRef.current!.computeVertexNormals();
  }, []);

  const array = new Array(width)
    .fill(undefined)
    .flatMap((_, x) => [
      ...vertices(x, y),
      ...vertices(x + 1, y),
      ...vertices(x, y + 1),
      ...vertices(x + 1, y + 1),
    ]);

  const indices = new Array(width)
    .fill(undefined)
    .flatMap((_, i) => [
      i * 4,
      i * 4 + 1,
      i * 4 + 2,
      i * 4 + 2,
      i * 4 + 1,
      i * 4 + 3,
    ]);

  return (
    <mesh key={y} ref={meshRef} position={[0, 0, 0]} receiveShadow>
      <bufferGeometry
        ref={geometryRef}
        index={new THREE.BufferAttribute(new Uint16Array(indices), 1)}
      >
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={array.length / 3}
          itemSize={3}
          array={new Float32Array(array)}
        />
      </bufferGeometry>
      {material}
    </mesh>
  );
};

let i = -1;
function Scene() {
  const [meshes, setMeshes] = useState<Array<JSX.Element>>([]);
  const lightRef = useRef<THREE.SpotLight>();
  const groupRef = useRef<THREE.Group>();
  const material = useMemo(
    () => (
      <meshLambertMaterial
        side={THREE.BackSide}
        color={new THREE.Color(242 / 255, 142 / 255, 92 / 255)}
      />
    ),
    [],
  );
  const sunPosition = [Math.PI, 0, 0];
  useEffect(() => {
    setMeshes(
      new Array(length)
        .fill(undefined)
        .map((_, y) => <Row key={y} y={y} material={material} />),
    );
    groupRef.current!.rotateY(-Math.PI / 2);
  }, []);

  useFrame(() => {
    i++;

    groupRef.current!.translateZ((-planeLength * t) / length / speed);

    if (i % speed !== 0) return;
    const newMeshes = [...meshes];
    for (let j = 0; j < t; j++) {
      newMeshes[((i * t) / speed + j) % length] = (
        <Row
          key={i + 400}
          y={(i * t) / speed + j + length - 1}
          material={material}
        />
      );
    }

    setMeshes(newMeshes);
  });

  return (
    <>
      <Sky
        // @ts-ignore
        distance={7000}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
        sunPosition={sunPosition}
        rayleigh={2.5}
        turbidity={5.4}
      />
      <group ref={groupRef}>{meshes}</group>
      <spotLight ref={lightRef} castShadow position={[4500, 800, 0]} />
      <Stars />
    </>
  );
}

export default function PerlinField() {
  return (
    <Container>
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [-500, 300, 0], far: 10000 }}
        shadowMap
      >
        <Scene />
        <OrbitControls />
      </Canvas>
    </Container>
  );
}
