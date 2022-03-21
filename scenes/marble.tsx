import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { ShaderMaterial } from 'three';
import shader from 'lib/shaders/marble';

const Dusen = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial>();

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

export const marbleConfig = {
  name: 'marble',
  Contents: Dusen,
  params: {},
};
