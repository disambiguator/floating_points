import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { sumBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { scaleMidi } from '../lib/midi';
import SpiroShader from '../lib/shaders/spiro';
import { Config, useSpectrum, useStore } from '../lib/store';

const numPoints = 50000;
const renderSpeed = 1000;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

interface Seed {
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
export const SpiroContents = ({ config }: { config: SpiroParams }) => {
  const set = useStore((state) => state.set);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>();

  const setDistort = useCallback((v) => {
    shaderMaterialRef.current!.uniforms.amplitude.value = scaleMidi(
      v,
      0,
      0.0005,
    );
  }, []);

  useSpectrum({ distort: setDistort });

  useControls('spiro', {
    'New Positions': button(() => {
      const newSeeds = initPositions();
      set((state) => {
        const env = state.env as Config<SpiroParams>;
        return {
          env: { ...env, params: { ...env.params, seeds: newSeeds } },
        };
      });
    }),
    distort: { value: 0, min: 0, max: 127, setDistort },
    color: {
      value: false,
      onChange: (v) => {
        shaderMaterialRef.current!.uniforms.color.value = v;
      },
    },
  });

  const positionAttributeRef = useRef<THREE.BufferAttribute>();
  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, []);

  const { seeds } = config;

  const positions = useRef(seeds ?? initPositions());

  useEffect(() => {
    if (seeds) positions.current = seeds;
  }, [seeds]);

  useFrame(({ clock }) => {
    positions.current = positions.current.map((p) => ({
      ...p,
      arc: p.arc + p.speed * renderSpeed,
      phi: p.phi + p.phiSpeed * renderSpeed,
    }));

    const { ray } = useStore.getState();

    const shaderMaterial = shaderMaterialRef.current;
    if (shaderMaterial) {
      shaderMaterial.uniforms.origin.value = ray.origin;
      shaderMaterial.uniforms.direction.value = ray.direction;
      shaderMaterial.uniforms.time.value = clock.elapsedTime;
    }

    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute) {
      positionAttribute.array = generateVertices(positions.current);
      positionAttribute.needsUpdate = true;
    }
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
      <shaderMaterial ref={shaderMaterialRef} args={[SpiroShader]} />
    </line>
  );
};

export const spiroConfig: Config<SpiroParams> = {
  Contents: SpiroContents,
  name: 'spiro',
  params: { seeds: initPositions() },
};
