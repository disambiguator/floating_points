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

export interface ClothConfig extends BaseConfig {
  contents: 'cloth';
  lineWidth: number;
  speed: number;
}

const color = 'cyan';
export const Cloth = React.memo(function Bars({
  config,
}: {
  config: ClothConfig;
}) {
  const meshRef = useRef<MeshLine>();
  const materialRef = useRef<MeshLineMaterial>();
  const noise2D = useMemo(() => makeNoise2D(Date.now()), []);
  const length = Math.floor(scaleMidi(config.noiseAmplitude, 1, 2000));
  useFrame(({ clock, size }) => {
    const mesh = meshRef.current!;
    mesh.vertices = new Array(length)
      .fill(undefined)
      .map(
        (f, i) =>
          new THREE.Vector3(
            ((i * size.width) / length - size.width / 2) * 2,
            noise2D(i * 0.01, clock.elapsedTime) * 100,
            0,
          ),
      );
    // materialRef.current!.color.setHex(String(Math.random() * 0xffffff * 0.8));
    // materialRef.current!.color = new THREE.Color(
    //   0,
    //   0.5 + 0.5 * Math.sin((3 * clock.elapsedTime) % Math.PI),
    //   0.5 + 0.5 * Math.sin((3 * clock.elapsedTime) % Math.PI),
    // );
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

export const clothControls = () => (
  <>
    <DatMidi label="Line width" path="lineWidth" />
    <DatMidi label="Speed" path="speed" />
  </>
);

const Effects = ({ config }: { config: Config }) => (
  <afterimagePass
    attachArray="passes"
    args={[BarsShader]}
    uniforms-damp-value={scaleMidi(config.trails, 0, 1)}
    uniforms-zoom-value={scaleMidi(config.zoomThreshold, 0, 0.02)}
  />
);

export default function BarsPage() {
  const config: ClothConfig = {
    ...defaultConfig,
    zoomThreshold: 57,
    noiseAmplitude: 100,
    trails: 125,
    contents: 'cloth',
    lineWidth: 1,
    CustomEffects: Effects,
  };
  return <Mixer config={config} />;
}
