import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { isEmpty } from 'lodash';
import React, { useRef } from 'react';
import type { AfterimagePass, Line2 } from 'three-stdlib';
import { SAMPLE_LENGTH } from '../lib/audio';
import { scaleMidi } from '../lib/midi';
import { type Config, useStore } from '../lib/store';

const BarsShader = {
  uniforms: {
    damp: { value: 0.96 },
    zoom: { value: 0.01 },
    tOld: { value: null },
    tNew: { value: null },
  },

  vertexShader: [
    'out vec2 vUv;',

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

    in vec2 vUv;

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

const Effects = () => {
  const ref = useRef<AfterimagePass>(null);

  useControls('bars', {
    damp: {
      value: 10,
      min: 0,
      max: 127,
      onChange: (damp) => {
        const pass = ref.current!;
        pass.uniforms.damp.value = scaleMidi(damp, 0, 1);
      },
    },
    zoom: {
      value: 10,
      min: 0,
      max: 127,
      onChange: (damp) => {
        const pass = ref.current!;
        pass.uniforms.zoom.value = scaleMidi(damp, 0, 0.3);
      },
    },
  });

  return (
    <afterimagePass ref={ref} attach="passes-2" args={[0.96, BarsShader]} />
  );
};

const color = 'cyan';
const Bars = React.memo(function Bars() {
  const lineRef = useRef<Line2>(null);

  const { lineWidth } = useControls('bars', {
    lineWidth: { value: 10, min: 0, max: 127 },
  });

  useFrame(({ size }) => {
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
      linewidth={lineWidth}
      points={new Array(SAMPLE_LENGTH * 3).fill(0)}
    />
  );
});

export const barsConfig: Config = {
  Contents: Bars,
  CustomEffects: Effects,
  name: 'bars',
  params: {},
  initialParams: {
    audioEnabled: true,
  },
};
