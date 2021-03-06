import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { isEmpty } from 'lodash';
import React, { useRef, useState } from 'react';
import { Line2 } from 'three-stdlib';
import Mixer from '../components/mixer';
import Page from '../components/page';
import { SAMPLE_LENGTH } from '../lib/audio';
import { scaleMidi } from '../lib/midi';
import { useStateUpdate } from '../lib/store';
import { useStore } from '../lib/store';

const Effects = () => {
  const zoomThreshold = useStore((state) => state.zoomThreshold);
  const trails = useStore((state) => state.trails);

  return (
    <afterimagePass
      attachArray="passes"
      args={[scaleMidi(trails, 0, 1), BarsShader]}
      uniforms-damp-value={scaleMidi(trails, 0, 1)}
      uniforms-zoom-value={scaleMidi(zoomThreshold, 0, 0.3)}
    />
  );
};

const BarsShader = {
  uniforms: {
    damp: { value: 0.96 },
    zoom: { value: 0.01 },
    tOld: { value: null },
    tNew: { value: null },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    '	vUv = uv;',
    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif
    uniform float damp;
    uniform float zoom;

    uniform sampler2D tOld;
    uniform sampler2D tNew;

    varying vec2 vUv;

    void main() {
    	vec4 texelNew = texture2D( tNew, vUv);

      vec2 coord = vUv;
      coord.y-=zoom;
      coord.x=(coord.x - 0.5) * 1.01 + 0.5;

    	vec4 texelOld = texture2D( tOld, coord ) * damp;

    	gl_FragColor = max(texelNew, texelOld);
    }
  `,
};

const color = 'cyan';
const Bars = React.memo(function Bars() {
  const { size } = useThree();
  const lineRef = useRef<Line2>(null);
  useFrame(() => {
    const { geometry } = lineRef.current!;
    const { frequencyData } = useStore.getState().spectrum;
    if (isEmpty(frequencyData)) return;

    const vertices = frequencyData.flatMap((f, i) => {
      return [((i * size.width) / SAMPLE_LENGTH - size.width / 2) * 2, f, 0];
    });

    geometry!.setPositions(vertices);
  });

  return (
    <Line
      position={[0, -800, -1000]}
      ref={lineRef}
      color={color}
      linewidth={10}
      points={new Array(SAMPLE_LENGTH * 3).fill(0)}
    />
  );
});

export const barsConfig = {
  Contents: Bars,
  CustomEffects: Effects,
  name: 'bars' as const,
  params: {},
};

export default function BarsPage() {
  useStateUpdate({
    zoomThreshold: 2,
    trails: 125,
    audioEnabled: true,
    env: barsConfig,
  });
  const [started, start] = useState(false);

  return started ? (
    <Mixer />
  ) : (
    <Page onClick={() => start(true)}>
      <div>Click to start</div>
    </Page>
  );
}
