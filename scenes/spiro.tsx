import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import React, { useCallback, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { scaleMidi, useMidi } from '../lib/midi';
import SpiroShader from '../lib/shaders/spiro';
import { type Config, useSpectrum, useStore } from '../lib/store';

const MAX_VERTICES = 1000;

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
  speed: (randInt(1, 10) * 360) / (randInt(10, 100) + 50000),
  phiSpeed: 0,
});

const getPoint = (radius: number, theta: number, phi: number) => [
  radius * Math.sin(theta) * Math.cos(phi),
  radius * Math.cos(theta) * Math.sin(phi),
  radius * Math.cos(theta),
];

const displacement = new Float32Array(MAX_VERTICES);
for (let i = 0; i < MAX_VERTICES; i++) {
  displacement[i] = Math.random() * 5;
}

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
  const shaderMaterialRef = useRef<typeof SpiroShader>();

  const setDistort = useCallback((v) => {
    shaderMaterialRef.current!.uniforms.amplitude.value = scaleMidi(
      v,
      0,
      0.0005,
    );
  }, []);

  useSpectrum({ distort: setDistort });

  const positions = useRef(initPositions());
  const newPositions = useCallback(() => {
    positions.current = initPositions();
  }, []);

  useControls('spiro', {
    'New Positions': button(newPositions),
    distort: { value: 0, min: 0, max: 127, onChange: setDistort },
    color: {
      value: false,
      onChange: (v) => {
        shaderMaterialRef.current!.uniforms.color.value = v;
      },
    },
  });

  const { numVertices } = useControls('spiro', {
    numVertices: { min: 0, max: 1000, value: MAX_VERTICES },
  });

  useMidi(useMemo(() => ({ function1: newPositions }), [newPositions]));

  const positionAttributeRef = useRef<THREE.BufferAttribute>();

  useFrame(({ clock }) => {
    positions.current.forEach((p) => {
      p.arc += p.speed * numVertices;
      p.phi += p.phiSpeed * numVertices;
    });

    const { ray } = useStore.getState();

    const shaderMaterial = shaderMaterialRef.current;
    if (shaderMaterial) {
      shaderMaterial.uniforms.origin.value = ray.origin;
      shaderMaterial.uniforms.direction.value = ray.direction;
      shaderMaterial.uniforms.time.value = clock.elapsedTime;
    }

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
          attachObject={['attributes', 'displacement']}
          count={numVertices}
          array={displacement}
          itemSize={1}
        />
        <bufferAttribute
          ref={positionAttributeRef}
          attachObject={['attributes', 'position']}
          count={numVertices}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial ref={shaderMaterialRef} args={[SpiroShader]} />
    </line>
  );
};

export const spiroConfig: Config = {
  Contents: SpiroContents,
  name: 'spiro',
  params: {},
};
