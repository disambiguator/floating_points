import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import React from 'react';
import type * as THREE from 'three';
import { randInt } from 'lib/helpers';
import { useRefState } from 'lib/hooks';
import { scaleMidi, useMidi } from '../lib/midi';
import SpiroShader from '../lib/shaders/spiro';
import { type Config, ray, useSpectrum } from '../lib/store';

const MAX_VERTICES = 1000;

type Seed = {
  radius: number;
  arc: number;
  phi: number;
  speed: number;
  phiSpeed: number;
};

const randPosition = (): Seed => ({
  radius: randInt(50, 300),
  arc: randInt(360),
  phi: randInt(360),
  speed: (randInt(1, 10) * 360) / (randInt(10, 100) + 50000),
  phiSpeed: 0,
});

const getPoint = (radius: number, theta: number, phi: number) =>
  [
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(theta),
  ] as const;

function generateVertices(numVertices: number, positions: Seed[]) {
  const vertices = new Float32Array(numVertices * 3);
  for (let i = 0; i < numVertices; i++) {
    let xSum = 0;
    let ySum = 0;
    let zSum = 0;
    positions.forEach((p) => {
      const [x, y, z] = getPoint(
        p.radius,
        p.arc + i * p.speed,
        p.phi + i * p.phiSpeed,
      );
      xSum += x;
      ySum += y;
      zSum += z;
    });

    const x = xSum / positions.length;
    const y = ySum / positions.length;
    const z = zSum / positions.length;

    vertices[i * 3] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;
  }
  return vertices;
}

const initPositions = () => [randPosition(), randPosition()];

const SpiroContents = () => {
  const shaderMaterial = React.useMemo(() => {
    const s = SpiroShader();
    s.uniforms.origin.value = ray.origin;
    s.uniforms.direction.value = ray.direction;
    return s;
  }, []);

  const positions = React.useRef(initPositions());
  const [speed, setSpeed] = useRefState(1);
  const newPositions = React.useCallback(() => {
    positions.current = initPositions();
  }, []);

  const [, setControl] = useControls('spiro', () => ({
    'New Positions': button(newPositions),
    distort: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shaderMaterial.uniforms.amplitude.value = scaleMidi(v, 0, 0.005);
      },
    },
    color: {
      value: false,
      onChange: (v: boolean) => {
        shaderMaterial.uniforms.color.value = v ? 1 : 0;
      },
    },
    speed: {
      value: 1,
      min: -10,
      max: 10,
      onChange: setSpeed,
    },
  }));

  useSpectrum({
    distort: (v: number) => {
      setControl({ distort: v });
    },
  });

  const { numVertices } = useControls('spiro', {
    numVertices: { min: 0, max: 1000, value: MAX_VERTICES },
  });

  useMidi(React.useMemo(() => ({ function1: newPositions }), [newPositions]));

  const positionAttributeRef = React.useRef<THREE.BufferAttribute>(null);

  useFrame(({ clock }) => {
    positions.current.forEach((p) => {
      p.arc += p.speed * numVertices * speed.current;
      p.phi += p.phiSpeed * numVertices * speed.current;
    });

    shaderMaterial.uniforms.time.value = clock.elapsedTime;

    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute) {
      positionAttribute.array = generateVertices(
        numVertices,
        positions.current,
      );
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttributeRef}
          attach="attributes-position"
          count={numVertices}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial args={[shaderMaterial]} />
    </line>
  );
};

export const spiroConfig = {
  Contents: SpiroContents,
  name: 'spiro',
} as const satisfies Config;
