import { OrbitControls, Sky } from 'drei';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import styled from 'styled-components';
import * as THREE from 'three';
import { makeNoise2D } from 'open-simplex-noise';
import { analyseSpectrum, useAudioUrl } from '../lib/audio';
import DatGui, { DatNumber } from 'react-dat-gui';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background: black;
`;

type Params = {
  speed: number;
  inclination: number;
};

const ControlPanel = ({
  params,
  setParams,
}: {
  params: Params;
  setParams: (arg0: Params) => void;
}) => {
  const onUpdate = (newData: Partial<Params>) => {
    setParams({ ...params, ...newData });
  };

  return (
    <DatGui data={{ ...params }} onUpdate={onUpdate} style={{ zIndex: 1 }}>
      <DatNumber path="speed" min={0} max={60} step={1} />
      <DatNumber path="inclination" min={-0.5} max={0.5} step={0.0001} />
    </DatGui>
  );
};

const length = 400;
const width = 400;
const zoom = 10;
const zoomX = zoom;
const zoomY = zoom;
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
  const distance = rand(3536, 10000);
  const pos = new THREE.Vector3();
  const direction = new THREE.Vector3(
    rand(-1, 1),
    rand(0, 1),
    rand(-1, 1),
  ).normalize();

  new THREE.Ray(new THREE.Vector3(0, 0, 0), direction).at(distance, pos);

  return pos;
};

const Stars = () => {
  const audio = useAudioUrl(
    process.env.NODE_ENV === 'development'
      ? 'void.mp3'
      : 'https://floating-points.s3.us-east-2.amazonaws.com/void.mp3',
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
};

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
    <mesh key={y} ref={meshRef} receiveShadow>
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

const Terrain = ({ speed }: { speed: number }) => {
  const iRef = useRef(-1);
  const yRef = useRef(-1);
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
  const [meshes, setMeshes] = useState(
    new Array(length)
      .fill(undefined)
      .map((_, y) => <Row key={y} y={y} material={material} />),
  );

  const frameOffset = Math.floor(60 / speed);
  useFrame(() => {
    iRef.current++;
    const i = iRef.current;

    groupRef.current!.translateZ((-planeLength * t) / length / frameOffset);

    if (i % frameOffset !== 0) return;
    yRef.current++;
    const y = yRef.current;
    const newMeshes = [...meshes];
    for (let j = 0; j < t; j++) {
      newMeshes[(y * t + j) % length] = (
        <Row key={i + length} y={y * t + j + length - 1} material={material} />
      );
    }

    setMeshes(newMeshes);
  });

  return <group ref={groupRef}>{meshes}</group>;
};

function Scene({ params }: { params: Params }) {
  const { speed, inclination } = params;
  const lightRef = useRef<THREE.SpotLight>();
  console.log(params);
  return (
    <>
      <Sky
        // @ts-ignore
        distance={sceneSize}
        mieCoefficient={0.005}
        mieDirectionalG={0.9}
        sunPosition={[0, inclination, -Math.PI]}
        rayleigh={8}
        turbidity={5.4}
      />
      <Terrain speed={speed} />
      <spotLight ref={lightRef} castShadow position={[4500, 800, 0]} />
      <Stars />
    </>
  );
}

export default function PerlinField() {
  const [params, setParams] = useState<Params>({
    speed: 3,
    inclination: Math.PI * -0.045,
  });
  return (
    <Container>
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [0, 400, 2500], far: 20000 }}
        shadowMap
      >
        <Scene params={params} />
        <OrbitControls />
      </Canvas>
      <ControlPanel {...{ params, setParams }} />
    </Container>
  );
}
