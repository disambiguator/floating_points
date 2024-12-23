import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import { Vector3 } from 'three';
import type { Config } from 'lib/store';
import Shader from '../lib/shaders/landscape';

const colorVector = new Vector3();

const Landscape = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const shader = React.useMemo(Shader, []);
  useFrame(({ clock }) => {
    const time = (clock.elapsedTime / 2) % 1;
    if (time < shader.uniforms.time.value) {
      shader.uniforms.color.value = colorVector.set(
        Math.random(),
        Math.random(),
        Math.random(),
      );
    }
    shader.uniforms.time.value = time;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial args={[shader]} uniforms-aspect-value={viewport.aspect} />
    </mesh>
  );
});

export const landscapeConfig = {
  name: 'landscape',
  Contents: Landscape,
} as const satisfies Config;
