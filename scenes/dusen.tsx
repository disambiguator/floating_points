import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { ShaderMaterial } from 'three';
import { scaleMidi } from '../lib/midi';
import DusenShader from '../lib/shaders/dusen';
import { Config, useStore } from '../lib/store';

const Dusen = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial>();
  const noiseAmplitude = useStore((state) => state.noiseAmplitude);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[DusenShader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-radius-value={scaleMidi(noiseAmplitude, 0, 1)}
      />
    </mesh>
  );
});

export const dusenConfig: Config = {
  name: 'dusen' as const,
  Contents: Dusen,
  params: {},
  initialParams: { noiseAmplitude: 27 },
};
