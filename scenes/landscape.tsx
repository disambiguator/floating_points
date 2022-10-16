import { useFrame, useThree } from '@react-three/fiber';
import { memo, useRef } from 'react';
import { Vector3 } from 'three';
import Shader from '../lib/shaders/landscape';
import { type Config } from '../lib/store';

const colorVector = new Vector3();

const Landscape = memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<typeof Shader>();
  useFrame(({ clock }) => {
    if (!ref.current) return;

    const time = (clock.elapsedTime / 2) % 1;
    if (time < ref.current.uniforms.time.value) {
      ref.current.uniforms.color.value = colorVector.set(
        Math.random(),
        Math.random(),
        Math.random(),
      );
    }
    ref.current.uniforms.time.value = time;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[Shader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </mesh>
  );
});

export const landscapeConfig: Config = {
  name: 'landscape',
  Contents: Landscape,
  params: {},
};