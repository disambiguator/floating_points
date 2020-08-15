import React, { useMemo, useRef } from 'react';
import Mixer, {
  Config,
  defaultConfig,
  scaleMidi,
  BaseConfig,
  DatMidi,
} from './mixer';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ReactThreeFiber, useFrame } from 'react-three-fiber';
import { extend } from 'react-three-fiber';
// @ts-ignore
import { MeshLine, MeshLineMaterial } from 'threejs-meshline';
import { makeNoise2D } from 'open-simplex-noise';

extend({ MeshLine, MeshLineMaterial });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLine: ReactThreeFiber.Object3DNode<MeshLine, typeof MeshLine>;
      meshLineMaterial: ReactThreeFiber.Object3DNode<
        MeshLineMaterial,
        typeof MeshLineMaterial
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

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

    	vec4 texelOld = texture2D( tOld, coord ) * damp;

    	gl_FragColor = max(texelNew, texelOld);
    }
  `,
};

type ClothParams = {
  lineWidth: number;
  speed: number;
};

const color = 'cyan';
const Cloth = React.memo(function Bars({
  config,
}: {
  config: ClothParams & BaseConfig;
}) {
  const meshRef = useRef<MeshLine>();
  const materialRef = useRef<MeshLineMaterial>();
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  const length = Math.floor(scaleMidi(config.zoomThreshold, 1, 2000));
  useFrame(({ clock, size }) => {
    const mesh = meshRef.current!;
    mesh.vertices = new Array(length)
      .fill(undefined)
      .map(
        (f, i) =>
          new THREE.Vector3(
            ((i * size.width) / length - size.width / 2) * 2,
            noise2D(i * 0.01, clock.elapsedTime) *
              scaleMidi(config.noiseAmplitude, 1, 500),
            0,
          ),
      );
    if (config.color) {
      materialRef.current!.color.setHex(String(Math.random() * 0xffffff));
    }
  });

  return (
    <mesh position={[0, -800, -1000]}>
      <meshLine ref={meshRef} attach="geometry" />
      <meshLineMaterial
        ref={materialRef}
        attach="material"
        lineWidth={scaleMidi(config.lineWidth, 1, 30)}
        color={color}
      />
    </mesh>
  );
});

export const clothControls = () => [
  // eslint-disable-next-line react/jsx-key
  <DatMidi label="Line width" path="lineWidth" />,
  // eslint-disable-next-line react/jsx-key
  <DatMidi label="Speed" path="speed" />,
];

const Effects = ({ params }: { params: ClothParams & BaseConfig }) => (
  <afterimagePass
    attachArray="passes"
    args={[BarsShader]}
    uniforms-damp-value={scaleMidi(params.trails, 0, 1)}
    uniforms-zoom-value={scaleMidi(params.speed, 0, 0.1)}
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
      trails: 125,
      lineWidth: 1,
      speed: 10,
    },
  };
  return <Mixer config={config} />;
}
