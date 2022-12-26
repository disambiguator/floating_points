import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import shader from 'lib/shaders/marble';
import type { Config } from 'lib/store';

const Dusen = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<typeof shader>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </mesh>
  );
});

export const marbleConfig: Config = {
  name: 'marble',
  Contents: Dusen,
  params: {},
};
