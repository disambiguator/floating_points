import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useState } from 'react';
import * as THREE from 'three';
import { scaleMidi } from 'lib/midi';
import vertexShader from 'lib/shaders/defaultForwardUV.vert';
import fragmentShader from 'lib/shaders/fade.frag';
import { type Config } from 'lib/store';

const circle = [];
for (let i = 0; i < 100; i++) {
  circle[i] = new THREE.Vector2();
}

const shader = {
  vertexShader,
  fragmentShader,
  uniforms: {
    aspect: { value: 0 },
    trailNoiseFrequency: { value: 0 },
    trailNoiseAmplitude: { value: 0 },
    time: { value: 0 },
    circle: { value: circle },
    circleTime: { value: new Array(100).fill(0) },
    numCircles: { value: 0 },
    aberration: { value: 0 },
  },
};

const Cloth = React.memo(function Cloth() {
  const size = useThree((t) => t.size);
  const viewport = useThree((t) => t.viewport);
  const clock = useThree((t) => t.clock);
  const { amplitude, frequency, aberration } = useControls({
    frequency: { value: 10, min: 0, max: 127 },
    amplitude: { value: 0, min: 0, max: 127 },
    aberration: { value: 0, min: 0, max: 0.1 },
  });

  useFrame(() => {
    shader.uniforms.time.value = clock.elapsedTime;
  });

  const onClick = ({ uv }: ThreeEvent<MouseEvent>) => {
    if (!uv) return;
    uv.multiplyScalar(2).subScalar(1);
    uv.x *= viewport.aspect;
    const c = shader.uniforms.circle.value;
    c[shader.uniforms.numCircles.value].set(uv.x, uv.y);
    shader.uniforms.circleTime.value[shader.uniforms.numCircles.value] =
      clock.elapsedTime;
    shader.uniforms.numCircles.value++;
  };

  return (
    <mesh position={[0, 0, -215]} onClick={onClick}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-trailNoiseFrequency-value={scaleMidi(frequency, 0, 200)}
        uniforms-trailNoiseAmplitude-value={scaleMidi(amplitude, 0, 1)}
        uniforms-aberration-value={aberration}
      />
    </mesh>
  );
});

export const fadeConfig: Config = {
  name: 'fade',
  Contents: Cloth,
  params: {},
};
