import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useMemo, useRef } from 'react';
import { scaleMidi } from '../lib/midi';
import { Config, useStore } from '../lib/store';

const length = 300;
const Cloth = React.memo(function Cloth() {
  const amplitude = useRef(100);
  const frequency = useRef(100);
  const { lineWidth } = useControls('cloth', {
    lineWidth: { value: 46, min: 0, max: 127, label: 'Line width' },
    amplitude: {
      value: 46,
      min: 0,
      max: 127,
      onChange: (v) => {
        amplitude.current = scaleMidi(v, 1, 500);
      },
    },
    frequency: {
      value: 46,
      min: 0,
      max: 127,
      onChange: (v) => {
        frequency.current = scaleMidi(v, 0, 0.2);
      },
    },
  });
  const lineRef = useRef<typeof Line>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);

  useFrame(({ clock, size }) => {
    const line = lineRef.current;
    if (!line) return;

    // @ts-ignore
    const { geometry, material } = line;
    geometry.setPositions(
      new Array(length)
        .fill(undefined)
        .flatMap((f, i) => [
          ((i * size.width) / length - size.width / 2) * 2,
          noise2D(i * frequency.current, clock.elapsedTime) * amplitude.current,
          0,
        ]),
    );

    const { color } = useStore.getState();
    if (color) {
      material!.color.setHSL((clock.getElapsedTime() / 5) % 1, 1, 0.2);
    }
  });

  return (
    <Line
      position={[0, -800, -1000]}
      // @ts-ignore
      ref={lineRef}
      color={'cyan'}
      linewidth={scaleMidi(lineWidth, 1, 30)}
      points={[
        [0, 0, 0],
        [0, 0, 100],
      ]}
    />
  );
});

export const clothConfig: Config = {
  name: 'cloth',
  Contents: Cloth,
  params: {},
  initialParams: {
    color: true,
  },
};
