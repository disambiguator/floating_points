import React, { useMemo, useRef } from 'react';
import Mixer, {
  Config,
  defaultConfig,
  scaleMidi,
  BaseConfig,
  DatMidi,
} from './mixer';
import { useFrame } from 'react-three-fiber';
import { makeNoise2D } from 'open-simplex-noise';
import { Line } from 'drei';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';

const BarsShader = {
  uniforms: {
    damp: { value: 0.96 },
    xspeed: { value: 0.01 },
    yspeed: { value: 0.01 },
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
    uniform float xspeed;
    uniform float yspeed;

    uniform sampler2D tOld;
    uniform sampler2D tNew;

    varying vec2 vUv;

    void main() {
    	vec4 texelNew = texture2D( tNew, vUv);

      vec2 coord = vUv;
      coord.y-=yspeed;

      coord.x=(coord.x - 0.5) * (1. + xspeed) + 0.5;

    	vec4 texelOld = texture2D( tOld, coord ) * damp;
    	gl_FragColor = length(texelNew) > 0. ? texelNew : texelOld;
    }
  `,
};

type ClothParams = {
  lineWidth: number;
  xSpeed: number;
  ySpeed: number;
};

const color = 'cyan';
const Cloth = React.memo(function Bars({
  config,
}: {
  config: ClothParams & BaseConfig;
}) {
  const lineRef = useRef<Line2>(null);
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  const length = Math.floor(scaleMidi(config.zoomThreshold, 1, 2000));
  useFrame(({ clock, size }) => {
    const line = lineRef.current!;
    const geometry = line.geometry as LineGeometry;
    const material = line.material as LineMaterial;

    geometry.setPositions(
      new Array(length)
        .fill(undefined)
        .flatMap((f, i) => [
          ((i * size.width) / length - size.width / 2) * 2,
          noise2D(i * 0.01, clock.elapsedTime) *
            scaleMidi(config.noiseAmplitude, 1, 500),
          0,
        ]),
    );

    if (config.color) {
      material.color.setHex(Math.random() * 0xffffff);
    }
  });

  return (
    <Line
      position={[0, -800, -1000]}
      ref={lineRef}
      color={color}
      linewidth={scaleMidi(config.lineWidth, 1, 30)}
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
  <DatMidi label="xSpeed" path="xSpeed" />,
  <DatMidi label="ySpeed" path="ySpeed" />,
  /* eslint-enable react/jsx-key */
];

const Effects = ({ params }: { params: ClothParams & BaseConfig }) => (
  <afterimagePass
    attachArray="passes"
    args={[BarsShader]}
    uniforms-damp-value={scaleMidi(params.trails, 0, 1)}
    uniforms-xspeed-value={scaleMidi(params.xSpeed, -0.04, 0.04)}
    uniforms-yspeed-value={scaleMidi(params.ySpeed, -0.04, 0.04)}
  />
);

export const clothConfig = {
  params: { name: 'cloth' as const },
  controls: clothControls,
  CustomEffects: Effects,
  Contents: Cloth,
};

export default function BarsPage() {
  const config: Config<ClothParams> = {
    ...clothConfig,
    params: {
      ...defaultConfig,
      ...clothConfig.params,
      zoomThreshold: 57,
      noiseAmplitude: 100,
      trails: 127,
      lineWidth: 46,
      xSpeed: 64,
      ySpeed: 64,
      color: true,
    },
  };
  return <Mixer config={config} />;
}
