import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useMemo, useRef } from 'react';
import MixerPage from '../components/mixer';
import { scaleMidi } from '../lib/midi';
import { useStore } from '../lib/store';
import { useStateUpdate } from '../lib/store';

const Cloth = React.memo(function Cloth() {
  const { lineWidth } = useControls({
    lineWidth: { value: 46, min: 0, max: 127, label: 'Line width' },
  });
  const lineRef = useRef<typeof Line>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);

  useFrame(({ clock, size }) => {
    const { color, zoomThreshold, noiseAmplitude } = useStore.getState();
    const length = Math.floor(scaleMidi(zoomThreshold, 1, 2000));

    const line = lineRef.current;
    if (!line) return;

    // @ts-ignore
    const { geometry, material } = line;
    const amplitude = scaleMidi(noiseAmplitude, 1, 500);
    geometry.setPositions(
      new Array(length)
        .fill(undefined)
        .flatMap((f, i) => [
          ((i * size.width) / length - size.width / 2) * 2,
          noise2D(i * 0.01, clock.elapsedTime) * amplitude,
          0,
        ]),
    );

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

export const clothConfig = {
  name: 'cloth' as const,
  Contents: Cloth,
  params: {},
};

export default function BarsPage() {
  useStateUpdate({
    color: true,
    zoomThreshold: 57,
    noiseAmplitude: 100,
    trails: 127,
    env: clothConfig,
  });

  return <MixerPage />;
}
