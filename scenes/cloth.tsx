import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useMemo, useRef } from 'react';
import type { Line2 } from 'three-stdlib';
import { useRefState } from 'lib/hooks';
import { scaleMidi } from '../lib/midi';
import { type Config, useSpectrum } from '../lib/store';

const length = 300;
const Cloth = React.memo(function Cloth() {
  const [amplitude, setAmplitude] = useRefState(100);
  const [freezeColor, setFreezeColor] = useRefState(false);
  const [frequency, setFrequency] = useRefState(100);
  const { lineWidth } = useControls('cloth', {
    lineWidth: { value: 46, min: 0, max: 127, label: 'Line width' },
    amplitude: {
      value: 46,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        setAmplitude(scaleMidi(v, 1, 500));
      },
    },
    frequency: {
      value: 46,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        setFrequency(scaleMidi(v, 0, 0.2));
      },
    },
    freezeColor: {
      value: false,
      onChange: setFreezeColor,
    },
  });
  const lineRef = useRef<Line2>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  useSpectrum({ amplitude: setAmplitude });

  useFrame(({ clock, size }) => {
    const line = lineRef.current;
    if (!line) return;

    const { geometry, material } = line;
    geometry.setPositions(
      new Array(length)
        .fill(undefined)
        .flatMap((_f, i) => [
          ((i * size.width) / length - size.width / 2) * 2,
          noise2D(i * frequency.current, clock.elapsedTime) * amplitude.current,
          0,
        ]),
    );

    if (!freezeColor.current) {
      material.color.setHSL((clock.getElapsedTime() / 5) % 1, 1, 0.2);
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

export const clothConfig: Config = {
  name: 'cloth',
  Contents: Cloth,
};
