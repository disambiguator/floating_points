import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React from 'react';
import FbmShader from 'lib/shaders/fbm';
import { scaleMidi } from '../lib/midi';
import type { Config } from '../lib/store';

const FbmContents = React.memo(function FbmContents() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const speed = React.useRef(0);
  const shader = FbmShader();

  useControls('fbm', {
    speed: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v) => {
        speed.current = scaleMidi(v / 2, 0, 20) ** 5;
      },
    },
  });

  useFrame(() => {
    shader.uniforms.time.value += speed.current;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        // uniforms-G-value={aspect}
      />
    </mesh>
  );
});

export const fbmConfig = {
  name: 'fbm',
  Contents: FbmContents,
} as const satisfies Config;
