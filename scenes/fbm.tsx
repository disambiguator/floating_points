import { useFrame, useThree } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import React, { useRef } from 'react';
import { ShaderMaterial } from 'three';
import FbmShader from 'lib/shaders/fbm';
import { scaleMidi } from '../lib/midi';
import { Config, useStore } from '../lib/store';

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
        args={[FbmShader]}
        uniforms-aspect-value={viewport.aspect}
        // uniforms-G-value={aspect}
      />
      <Perf />
    </mesh>
  );
});

export const fbmConfig: Config = {
  name: 'fbm',
  Contents: FbmContents,
  params: {},
  initialParams: {},
};