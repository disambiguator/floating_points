import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useMemo, useRef } from 'react';
import MixerPage from '../components/mixer';
import { scaleMidi } from '../lib/midi';
import { useStore } from '../lib/store';
import { useStateUpdate } from '../lib/store';

const Control = React.memo(function Control() {
  useFrame(({ clock, size }) => {
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

export const controlConfig = {
  name: 'control' as const,
  Contents: Control,
  params: {},
};

export default function ControlPage() {
  useStateUpdate({
    env: controlConfig,
  });

  return <MixerPage />;
}
