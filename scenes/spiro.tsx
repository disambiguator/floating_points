import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { sumBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Line2 } from 'three-stdlib';
import { useMidi } from '../lib/midi';
import { type Config, useStore } from '../lib/store';

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

const displacement = new Float32Array(renderSpeed);
for (let i = 0; i < renderSpeed; i++) {
  displacement[i] = Math.random() * 5;
}

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
  const lineRef = useRef<Line2>(null);

  const newPositions = useCallback(() => {
    const newSeeds = initPositions();
    set((state) => {
      const env = state.env as Config<SpiroParams>;
      return {
        env: { ...env, params: { ...env.params, seeds: newSeeds } },
      };
    });
  }, [set]);

  useControls('spiro', {
    'New Positions': button(newPositions),
    // color: {
    //   value: false,
    //   onChange: (v) => {
    //     lineRef.current!.material.color = v;
    //   },
    // },
  });

  useMidi(useMemo(() => ({ function1: newPositions }), [newPositions]));

  const { seeds } = config;

  const positions = useRef(seeds ?? initPositions());

  useEffect(() => {
    if (seeds) positions.current = seeds;
  }, [seeds]);

  useFrame(() => {
    positions.current.forEach((p) => {
      p.arc += p.speed * renderSpeed;
      p.phi += p.phiSpeed * renderSpeed;
    });

    const line = lineRef.current;
    if (line) {
      line.geometry.setPositions(generateVertices(positions.current));
      // material.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[
        [0, 0, 0],
        [0, 0, 100],
      ]}
      // @ts-expect-error - drei update should fix it
      color={'purple'}
      lineWidth={3}
      alphaWrite={undefined} // IDK why i need this
    />
  );
};

export const spiroConfig: Config<SpiroParams> = {
  Contents: SpiroContents,
  name: 'spiro',
  params: { seeds: initPositions() },
};
