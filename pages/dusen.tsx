import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { ShaderMaterial } from 'three';
import MixerPage from '../components/mixer';
import { shaders } from '../components/scenes';
import { scaleMidi } from '../lib/midi';
import { useStateUpdate, useStore } from '../lib/store';

const Dusen = React.memo(function Dusen() {
  const { viewport, size, clock } = useThree();
  const ref = useRef<ShaderMaterial>();
  const noiseAmplitude = useStore((state) => state.noiseAmplitude);

  useFrame(() => {
    if (ref.current) ref.current.uniforms.time.value = clock.elapsedTime;
  });

  const name = 'dusen';
  const shader = shaders[name];

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-radius-value={scaleMidi(noiseAmplitude, 0, 1)}
      />
    </mesh>
  );
});

export const dusenConfig = {
  name: 'dusen' as const,
  Contents: Dusen,
  params: {},
};

export default function DusenPage() {
  useStateUpdate({ noiseAmplitude: 27, env: dusenConfig });

  return <MixerPage />;
}
