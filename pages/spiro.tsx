import { sumBy } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { DatButton } from 'react-dat-gui';
import { useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import Mixer, { BaseConfig, Config, scaleMidi } from '../components/mixer';
import SpiroShader from '../lib/shaders/spiro';
import { useStore } from '../lib/store';

const numPoints = 50000;
const renderSpeed = 1000;

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

const randPosition = (): Seed => ({
  radius: randInt(50, 300),
  arc: randInt(0, 360),
  phi: randInt(0, 360),
  speed: (randInt(1, 10) * 360) / (randInt(10, 100) + numPoints),
  phiSpeed: 0,
});

const getPoint = (radius: number, theta: number, phi: number) => {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi);
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi);
  const zCoordinate = radius * Math.cos(theta);
  return { x: xCoordinate, y: yCoordinate, z: zCoordinate };
};

function generateVertices(positions: Seed[]) {
  const vertices = new Float32Array(renderSpeed * 3);
  for (let i = 0; i < renderSpeed; i++) {
    const points = positions.map((p) =>
      getPoint(p.radius, p.arc + i * p.speed, p.phi + i * p.phiSpeed),
    );

    const x = sumBy(points, 'x') / points.length;
    const y = sumBy(points, 'y') / points.length;
    const z = sumBy(points, 'z') / points.length;

    vertices[i * 3] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;
  }
  return vertices;
}

export const initPositions = () => [randPosition(), randPosition()];

interface SpiroParams {
  seeds?: Seed[];
}
export const SpiroContents = ({
  config,
}: {
  config: SpiroParams & BaseConfig;
}) => {
  const { clock } = useThree();
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>();
  const positionAttributeRef = useRef<THREE.BufferAttribute>();
  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, []);
  const { color, noiseAmplitude } = useStore(({ color, noiseAmplitude }) => ({
    color,
    noiseAmplitude,
  }));
  const { seeds } = config;

  const positions = useRef(seeds ?? initPositions());

  useEffect(() => {
    if (seeds) positions.current = seeds;
  }, [seeds]);

  useFrame(() => {
    positions.current = positions.current.map((p) => ({
      ...p,
      arc: p.arc + p.speed * renderSpeed,
      phi: p.phi + p.phiSpeed * renderSpeed,
    }));

    const { ray } = useStore.getState();

    const shaderMaterial = shaderMaterialRef.current!;
    shaderMaterial.uniforms.origin.value = ray.origin;
    shaderMaterial.uniforms.direction.value = ray.direction;
    shaderMaterial.uniforms.time.value = clock.elapsedTime;

    const positionAttribute = positionAttributeRef.current!;
    positionAttribute.array = generateVertices(positions.current);
    positionAttribute.needsUpdate = true;
  });

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'displacement']}
          count={renderSpeed}
          array={displacement}
          itemSize={1}
        />
        <bufferAttribute
          ref={positionAttributeRef}
          attachObject={['attributes', 'position']}
          count={renderSpeed}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderMaterialRef}
        args={[SpiroShader]}
        uniforms-color-value={color}
        uniforms-amplitude-value={scaleMidi(noiseAmplitude, 0, 0.0005)}
        uniforms-time-value={clock.elapsedTime}
      />
    </line>
  );
};

const spiroControls = ({
  onUpdate,
}: {
  onUpdate: (newData: Partial<SpiroParams & BaseConfig>) => void;
}) => {
  return [
    // eslint-disable-next-line react/jsx-key
    <DatButton
      onClick={() => {
        const newSeeds = initPositions();
        onUpdate({ seeds: newSeeds });
        const url = `/spiro?seeds=${JSON.stringify(newSeeds)}`;
        window.history.pushState('', '', url);
      }}
      label="New Positions"
    />,
  ];
};

export const spiroConfig = {
  Contents: SpiroContents,
  controls: spiroControls,
  params: { name: 'spiro' as const },
};

export default function SpiroPage() {
  const router = useRouter();
  const urlSeeds = router.query.seeds as string | undefined;

  const config: Config<SpiroParams> = {
    ...spiroConfig,
    params: {
      ...spiroConfig.params,
      seeds: urlSeeds ? JSON.parse(urlSeeds) : initPositions(),
    },
  };
  return <Mixer config={config} />;
}
