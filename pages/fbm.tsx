import { useFrame, useThree } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import React, { useRef } from 'react';
import { ShaderMaterial } from 'three';
import MixerPage from '../components/mixer';
import { shaders } from '../components/scenes';
import { scaleMidi } from '../lib/midi';
import { useStateUpdate, useStore } from '../lib/store';

const shader = shaders['fbm'];

const FbmContents = React.memo(function FbmContents() {
  const { viewport, size } = useThree();
  const ref = useRef<ShaderMaterial>();

  useFrame(() => {
    const { noiseAmplitude } = useStore.getState();
    ref.current!.uniforms.time.value +=
      scaleMidi(noiseAmplitude / 2, 0, 20) ** 5;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        // uniforms-G-value={aspect}
      />
      <Perf />
    </mesh>
  );
});

export const fbmConfig = {
  name: 'fbm',
  Contents: FbmContents,
  params: {},
};

export default function DusenPage() {
  useStateUpdate({ env: fbmConfig });

  return <MixerPage />;
}
