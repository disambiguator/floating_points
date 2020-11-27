import React, { useMemo, useRef } from 'react';
import Mixer, {
  Config,
  defaultConfig,
  scaleMidi,
  BaseConfig,
  DatMidi,
} from '../components/mixer';
import { useFrame, useThree } from 'react-three-fiber';
import { makeNoise2D } from 'open-simplex-noise';
import { Line } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { AfterimagePass } from '../components/AfterimagePass';
import * as THREE from 'three';

const BarsShader = {
  uniforms: {
    damp: { value: 0.96 },
    xspeed: { value: 0.01 },
    yspeed: { value: 0.01 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    mouse: { value: new THREE.Vector2(0, 0) },
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
    uniform vec2 mouse;
    uniform float time;

    const float PI = 3.14159265359;

    uniform sampler2D tOld;
    uniform sampler2D tNew;

    varying vec2 vUv;

    float blendOverlay(float base, float blend) {
       return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
    }

    vec4 blendOverlay(vec4 base, vec4 blend) {
      return vec4(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b), 1.);
    }

    vec2 rotation() {
      float angle = 1.;
      float rad = angle * PI / 180.;
      return vec2(sin(rad), cos(rad));
    }

    void main() {
    	vec4 texelNew = texture2D(tNew, vUv);

      // Shift to -1 to 1 coordinate system
      vec2 coord = (vUv - 0.5) * 2.;

      // Rotate defined angle
      coord.x = coord.x * rotation().y + coord.y * rotation().x;
      coord.y = coord.y * rotation().y - coord.x * rotation().x;

      // tunnel and zoom
      float scale = 0.05;
      coord.y=(coord.y - mouse.y) * (1. + scale * yspeed) + mouse.y;
      coord.x=(coord.x - mouse.x) * (1. + scale * xspeed) + mouse.x;

      // Get old frame (in 0 to 1 coordinate system)
    	vec4 texelOld = texture2D(tOld, (coord + 1.)/2.) - (1. - damp);

    	gl_FragColor = length(texelNew) > 0. ? mix(texelNew, texelOld, 0.5) : texelOld;
    }
  `,
};

type ClothParams = {
  lineWidth: number;
  xSpeed: number;
  ySpeed: number;
};

const color = 'cyan';
const Cloth = React.memo(function Cloth({
  config,
}: {
  config: ClothParams & BaseConfig;
}) {
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

const Effects = ({ params }: { params: ClothParams & BaseConfig }) => {
  const afterimagePassRef = useRef<AfterimagePass>();
  const { mouse, clock } = useThree();
  useFrame(() => {
    const shaderMaterial = afterimagePassRef.current!;
    shaderMaterial.uniforms.mouse.value = mouse;
    shaderMaterial.uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <afterimagePass
      ref={afterimagePassRef}
      attachArray="passes"
      args={[BarsShader]}
      uniforms-damp-value={scaleMidi(params.trails, 0.8, 1)}
      uniforms-xspeed-value={scaleMidi(params.xSpeed, -1, 1)}
      uniforms-yspeed-value={scaleMidi(params.ySpeed, -1, 1)}
    />
  );
};

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
