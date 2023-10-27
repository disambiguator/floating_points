import { useFrame, useThree } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import { memo, useEffect, useMemo } from 'react';
import { INITIAL_CAMERA_STATE } from 'components/config';
import { scaleMidi, useMidi } from '../lib/midi';
import DusenShader from '../lib/shaders/dusen';
import { type Config, useSpectrum } from '../lib/store';

export const Dusen = memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const camera = useThree((t) => t.camera);
  const shader = useMemo(DusenShader, []);
  const [{ speed }, setControls] = useControls(() => ({
    dusen: folder({
      radius: {
        value: 27,
        min: 0,
        max: 127,
        onChange: (v: number) => {
          shader.uniforms.radius.value = scaleMidi(v, 0, 1);
        },
      },
      speed: {
        value: 1,
        min: 0,
        max: 5,
      },
    }),
  }));
  useSpectrum({
    radius: (v) => {
      // @ts-expect-error - dont know why this does not work
      setControls({ radius: v });
    },
  });

  useMidi(
    useMemo(
      () => ({
        1: (value, modifiers) => {
          if (modifiers.shift) {
            // @ts-expect-error - dont know why this does not work
            setControls({ radius: value });
          }
        },
      }),
      [setControls],
    ),
  );

  useEffect(() => {
    // Reset camera position to original
    // This is not super generic yet, and it should be if we re-use this.
    camera.far = INITIAL_CAMERA_STATE.far;
    camera.position.set(...INITIAL_CAMERA_STATE.position);
  }, [camera]);

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
  params: {},
};
