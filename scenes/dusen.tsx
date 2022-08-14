import { useFrame, useThree } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { ShaderMaterial } from 'three';
import { INITIAL_CAMERA_STATE } from 'components/config';
import { scaleMidi, useMidi } from '../lib/midi';
import DusenShader from '../lib/shaders/dusen';
import { type Config, useSpectrum } from '../lib/store';

const Dusen = memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial>();
  const [radius, setRadius] = useState(0);
  const camera = useThree((t) => t.camera);
  const [, setControls] = useControls(() => ({
    dusen: folder({
      radius: {
        value: 27,
        min: 0,
        max: 127,
        onChange: setRadius,
      },
    }),
  }));
  useSpectrum({ radius: setRadius });

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

  useFrame(({ clock }) => {
    if (ref.current) ref.current.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[DusenShader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-radius-value={scaleMidi(radius, 0, 1)}
      />
    </mesh>
  );
});

export const dusenConfig: Config = {
  name: 'dusen',
  Contents: Dusen,
  params: {},
};
