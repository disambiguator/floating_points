import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { memo, useMemo } from 'react';
import { scaleMidi, useMidi } from '../lib/midi';
import DusenShader from '../lib/shaders/dusen';
import { type Config, useSpectrum } from '../lib/store';

export const Dusen = memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const shader = useMemo(DusenShader, []);
  const [{ speed }, setControls] = useControls('dusen', () => ({
    radius: {
      value: 27,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shader.uniforms.radius.value = scaleMidi(v, 0, 1);
      },
    },
    speed: { value: 1, min: 0, max: 5 },
  }));
  useSpectrum({
    radius: (v) => {
      setControls({ radius: v });
    },
  });

  // useMidi(
  //   useMemo(
  //     () => ({
  //       1: (value, modifiers) => {
  //         if (modifiers.shift) {
  //           setControls({ radius: value });
  //         }
  //       },
  //     }),
  //     [setControls],
  //   ),
  // );

  useFrame((_, delta) => {
    shader.uniforms.time.value += delta * speed;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial args={[shader]} uniforms-aspect-value={viewport.aspect} />
    </mesh>
  );
});

export const dusenConfig: Config = {
  name: 'dusen',
  Contents: Dusen,
};
