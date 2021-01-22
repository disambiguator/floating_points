import React, { useMemo, useRef } from 'react';
import Mixer, {
  Config,
  defaultConfig,
  scaleMidi,
  BaseConfig,
  useMidiControl,
} from '../components/mixer';
import { useFrame } from 'react-three-fiber';
import { makeNoise2D } from 'open-simplex-noise';
import { Line } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { Color } from 'three';

function interpolateCosine(
  [ar, ag, ab]: [number, number, number],
  [br, bg, bb]: [number, number, number],
  [cr, cg, cb]: [number, number, number],
  [dr, dg, db]: [number, number, number],
) {
  return (t: number) =>
    [
      ar + br * Math.cos(2 * Math.PI * (cr * t + dr)),
      ag + bg * Math.cos(2 * Math.PI * (cg * t + dg)),
      ab + bb * Math.cos(2 * Math.PI * (cb * t + db)),
    ].map((v) => Math.max(0, Math.min(1, v)));
}

const color = 'cyan';
const Cloth = React.memo(function Cloth({ config }: { config: BaseConfig }) {
  const lineWidth = useMidiControl('Line width', { value: 10 });
  const lineRef = useRef<Line2>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  const length = Math.floor(scaleMidi(config.zoomThreshold, 1, 2000));
  useFrame(({ clock, size }) => {
    const line = lineRef.current!;
    const { geometry, material } = line;
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
    line.position.y += 1;

    if (config.color) {
      // material!.color.setHSL((clock.getElapsedTime() / 5) % 1, 1, 0.2);
      material!.color = new Color(
        ...interpolateCosine(
          [0.2, 0.5, 0.5],
          [0.5, 0.2, 0.5],
          [1.0, 1.0, 1.0],
          [0.4, 0.2, 0.2],
        )(clock.getElapsedTime() / 20),
      );
    }
  });

  return (
    <Line
      position={[0, -1000, -1000]}
      ref={lineRef}
      color={color}
      linewidth={scaleMidi(lineWidth, 1, 30)}
      stencilMask={false} // Not sure why I need this
      points={[
        [0, 0, 0],
        [0, 0, 100],
      ]}
    />
  );
});

export const clothConfig = {
  params: { name: 'cloth' as const },
  Contents: Cloth,
};

export default function BarsPage() {
  const config: Config<BaseConfig> = {
    ...clothConfig,
    params: {
      ...defaultConfig,
      ...clothConfig.params,
      zoomThreshold: 57,
      noiseAmplitude: 80,
      trails: 127,
      color: true,
    },
  };
  return <Mixer config={config} />;
}
