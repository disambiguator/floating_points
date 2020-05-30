import * as THREE from 'three';
import { sumBy } from 'lodash';
import { useEffect, useRef } from 'react';
import React from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import { DatButton } from 'react-dat-gui';
import Mixer, { BaseConfig, defaultConfig } from './mixer';
import { useRouter } from 'next/router';

// const renderSpeed = 1000;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

export interface Seed {
  radius: number;
  arc: number;
  phi: number;
  speed: number;
  phiSpeed: number;
}
const renderSpeed = 10000;

const randPosition = (): Seed => ({
  radius: randInt(50, 300),
  arc: randInt(0, 360),
  phi: randInt(0, 360),
  speed: (randInt(1, 10) * 360) / randInt(10, 100),
  phiSpeed: 0,
});

const getPoint = (radius: number, theta: number, phi: number) => {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi);
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi);
  const zCoordinate = radius * Math.cos(theta);
  return { x: xCoordinate, y: yCoordinate, z: zCoordinate };
};

function generateVertices(positions: Seed[]) {
  const vertices = [];
  // const renderSpeed = positions.map((p) => p.speed).reduce((a, b) => a * b);
  console.log(renderSpeed);
  for (let i = 0; i < renderSpeed; i++) {
    const points = positions.map((p) =>
      getPoint(p.radius, p.arc + i * p.speed, p.phi + i * p.phiSpeed),
    );

    const x = sumBy(points, 'x') / points.length;
    const y = sumBy(points, 'y') / points.length;
    const z = sumBy(points, 'z') / points.length;

    vertices[i] = new THREE.Vector3(x, y, z);
  }
  return vertices;
}

export const initPositions = () => [randPosition(), randPosition()];

interface SpirographProps {
  seeds?: Seed[];
  config: SpiroConfig;
}

export const SpiroContents = ({ config }: SpirographProps) => {
  const { seeds } = config;
  const lightRef = useRef<THREE.PointLight>();
  // const { camera } = useThree();
  const positions = useRef(seeds ?? initPositions());

  const vertices = generateVertices(positions.current);
  const geometry = new THREE.TubeBufferGeometry(
    new THREE.CatmullRomCurve3(vertices),
    vertices.length,
    2,
    8,
    false,
  );
  const material = new THREE.MeshLambertMaterial({ color: 0x00ffff });

  useEffect(() => {
    if (seeds) positions.current = seeds;
  }, [seeds]);

  useEffect(() => {
    // camera.add(lightRef.current!);
  }, []);

  // const { clock } = useThree();

  useFrame(() => {
    positions.current = positions.current.map((p) => ({
      ...p,
      arc: p.arc + p.speed * renderSpeed,
      phi: p.phi + p.phiSpeed * renderSpeed,
    }));
    lightRef.current!.rotation.y += 0.1;
    // lightRef.current!.position.z = Math.sin(clock.elapsedTime * Math.PI) * 2000;
    // console.log(lightRef.current!.position);
    const vertices = generateVertices(positions.current);
    geometry.copy(
      new THREE.TubeBufferGeometry(
        new THREE.CatmullRomCurve3(vertices),
        vertices.length,
        2,
        8,
        false,
      ),
    );
  });

  return (
    <>
      <pointLight ref={lightRef} position={[0, 200, 200]} />
      <mesh {...{ geometry, material }} />
    </>
  );
};

interface SceneProps {
  config: SpiroConfig;
}

export interface SpiroConfig extends BaseConfig {
  contents: 'spiro';
  seeds: Seed[];
}

export const SpiroControls = ({
  onUpdate,
}: {
  onUpdate: (newData: Partial<SpiroConfig>) => void;
}) => {
  return (
    <DatButton
      onClick={() => {
        const newSeeds = initPositions();
        onUpdate({ seeds: newSeeds });
        const url = `/spiro?seeds=${JSON.stringify(newSeeds)}`;
        window.history.pushState('', '', url);
      }}
      label="New Positions"
    />
  );
};

export default () => {
  const router = useRouter();
  const urlSeeds = router.query.seeds as string | undefined;

  const config = {
    ...defaultConfig,
    trails: 0,
    contents: 'spiro',
    seeds: urlSeeds ? JSON.parse(urlSeeds) : initPositions(),
  } as const;
  return <Mixer config={config} />;
};
