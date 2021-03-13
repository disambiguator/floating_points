import { Line } from '@react-three/drei';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useMemo, useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import Mixer, { useMidiControl } from '../components/mixer';
import { scaleMidi } from '../lib/midi';
import { useStateUpdate, useStore } from '../lib/store';

const Cloth = React.memo(function Cloth() {
  const lineWidth = useMidiControl('Line width', { value: 46 });
  const lineRef = useRef<Line2>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  const { color, zoomThreshold, noiseAmplitude } = useStore(
    ({ color, zoomThreshold, noiseAmplitude }) => ({
      color,
      zoomThreshold,
      noiseAmplitude,
    }),
  );
  const length = Math.floor(scaleMidi(zoomThreshold, 1, 2000));

  useFrame(({ clock, size }) => {
    const { geometry, material } = lineRef.current!;
    const amplitude = scaleMidi(noiseAmplitude, 1, 500);
    geometry!.setPositions(
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

  return <Mixer />;
}
