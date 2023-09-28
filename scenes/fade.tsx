import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect, useRef, useState } from 'react';
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

type Circle = {
  x: number;
  y: number;
  time: number;
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

  const [circles, setCircles] = useState<Circle[]>([]);
  useEffect(() => {
    const c = shader.uniforms.circle.value;
    circles.forEach(({ x, y, time }, i) => {
      c[i].set(x, y);
      shader.uniforms.circleTime.value[i] = time;
    });
    shader.uniforms.numCircles.value = circles.length;
  }, [circles]);

  const lastClear = useRef(0);
  useFrame(() => {
    shader.uniforms.time.value = clock.elapsedTime;

    if (clock.elapsedTime - lastClear.current > 3) {
      setCircles((circ) => {
        return circ.filter((c) => clock.elapsedTime - c.time < 10);
      });
      lastClear.current = clock.elapsedTime;
    }
  });

  const onClick = ({ uv }: ThreeEvent<MouseEvent>) => {
    if (!uv) return;
    uv.multiplyScalar(2).subScalar(1);
    uv.x *= viewport.aspect;

    setCircles((c) => [...c, { x: uv.x, y: uv.y, time: clock.elapsedTime }]);
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
