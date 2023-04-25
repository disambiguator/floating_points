import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import MarbleShader from 'lib/shaders/marble';
import type { Config } from 'lib/store';

const Dusen = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const shader = MarbleShader();

  useFrame(({ clock }) => {
    shader.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial args={[shader]} uniforms-aspect-value={viewport.aspect} />
    </mesh>
  );
});

export const marbleConfig: Config = {
  name: 'marble',
  Contents: Dusen,
  params: {},
};
