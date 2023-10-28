import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useMemo } from 'react';
import { shaders } from 'components/scenes';
import type { Config } from 'lib/store';

const Dusen = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);

  const { name } = useControls({
    name: {
      value: 'marble',
      options: Object.keys(shaders),
    },
  });

  const shader = useMemo(() => shaders[name as keyof typeof shaders](), [name]);

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
  name: 'shader',
  Contents: Dusen,
};
