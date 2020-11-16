import { OrbitControls, Sky } from 'drei';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import styled from 'styled-components';
import * as THREE from 'three';
import { makeNoise2D } from 'open-simplex-noise';
import { analyseSpectrum, useAudioUrl } from '../lib/audio';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background: black;
`;

const length = 400;
const width = 400;
const zoom = 10;
const zoomX = zoom;
const zoomY = zoom;
const speed = 30;
const planeLength = 5000;
const planeWidth = 5000;
const t = 1;
const sceneSize = 7000;

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
const newPosition = () => {
  const distance = rand(3536, 4000);
  const pos = new THREE.Vector3();
  const direction = new THREE.Vector3(
    rand(-1, 1),
    rand(0, 1),
    rand(-1, 1),
  ).normalize();

  new THREE.Ray(new THREE.Vector3(0, 0, 0), direction).at(distance, pos);

  return pos;
};

const Stars = React.memo(function Stars() {
  const audio = useAudioUrl(
    'https://floating-points.s3.us-east-2.amazonaws.com/void.mp3',
  );

  const materialRef = useRef<THREE.PointsMaterial>();
  const pointsRef = useRef<THREE.Points>();

  const vertices = useMemo(
    () => new Array(2000).fill(undefined).map(newPosition),
    [],
  );

  useFrame(() => {
    const size = audio
      ? 20 + Math.pow(analyseSpectrum(audio).volume / 5, 2)
      : 20;
    materialRef.current!.size = size;

    pointsRef.current!.rotation.y += 0.001;
  });

  return (
    <points ref={pointsRef}>
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
const Terrain = () => {
  const [meshes, setMeshes] = useState<Array<JSX.Element>>([]);
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

  return <group ref={groupRef}>{meshes}</group>;
};

function Scene() {
  const lightRef = useRef<THREE.SpotLight>();
  return (
    <>
      <Sky
        // @ts-ignore
        distance={sceneSize}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
        sunPosition={[Math.PI, Math.PI * -0.045, 0]}
        rayleigh={2.5}
        turbidity={5.4}
      />
      <Terrain />
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
        camera={{ position: [-500, 200, 0], far: 20000 }}
        shadowMap
      >
        <Scene />
        <OrbitControls />
      </Canvas>
    </Container>
  );
}
