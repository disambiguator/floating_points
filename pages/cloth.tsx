import React, { useMemo, useRef } from 'react';
import Mixer, {
  Config,
  defaultConfig,
  scaleMidi,
  BaseConfig,
  DatMidi,
  useMidiControl,
} from '../components/mixer';
import { useFrame } from 'react-three-fiber';
import { makeNoise2D } from 'open-simplex-noise';
import { Line } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';

const color = 'cyan';
const Cloth = React.memo(function Cloth({ config }: { config: BaseConfig }) {
  const lineWidth = useMidiControl('Line width', { value: 46 });
  const lineRef = useRef<Line2>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  const length = Math.floor(scaleMidi(config.zoomThreshold, 1, 2000));
  useFrame(({ clock, size }) => {
    const { geometry, material } = lineRef.current!;
    const amplitude = scaleMidi(config.noiseAmplitude, 1, 500);
    geometry!.setPositions(
      new Array(length)
        .fill(undefined)
        .flatMap((f, i) => [
          ((i * size.width) / length - size.width / 2) * 2,
          noise2D(i * 0.01, clock.elapsedTime) * amplitude,
          0,
        ]),
    );

    if (config.color) {
      material!.color.setHSL((clock.getElapsedTime() / 5) % 1, 1, 0.2);
    }
  });

  return (
    <Line
      position={[0, -800, -1000]}
      ref={lineRef}
      color={color}
      linewidth={scaleMidi(lineWidth, 1, 30)}
      points={[
        [0, 0, 0],
        [0, 0, 100],
      ]}
    />
  );
});

export const clothControls = () => [
  /* eslint-disable react/jsx-key */
  <DatMidi label="Line width" path="lineWidth" />,
  /* eslint-enable react/jsx-key */
];

export const clothConfig = {
  params: { name: 'cloth' as const },
  controls: clothControls,
  Contents: Cloth,
};

export default function BarsPage() {
  const config: Config<BaseConfig> = {
    ...clothConfig,
    params: {
      ...defaultConfig,
      ...clothConfig.params,
      zoomThreshold: 57,
      noiseAmplitude: 100,
      trails: 127,
      color: true,
    },
  };
  return <Mixer config={config} />;
}
