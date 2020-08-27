import React, { useMemo, useRef, useState } from 'react';
import Mixer, { Config, defaultConfig, BaseConfig, scaleMidi } from './mixer';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ReactThreeFiber, useFrame } from 'react-three-fiber';
import { extend } from 'react-three-fiber';
// @ts-ignore
import { MeshLine, MeshLineMaterial } from 'threejs-meshline';
import Page from './page';
import { useStore } from '../lib/store';

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

const Effects = ({ params }: { params: BaseConfig }) => (
  <afterimagePass
    attachArray="passes"
    args={[BarsShader]}
    uniforms-damp-value={scaleMidi(params.trails, 0, 1)}
    uniforms-zoom-value={scaleMidi(params.zoomThreshold, 0, 0.3)}
  />
);

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
  const meshRef = useRef<MeshLine>();
  useFrame(() => {
    const { frequencyData } = useStore.getState().spectrum;
    if (frequencyData === []) return;
    const mesh = meshRef.current!;
    mesh.vertices = frequencyData.map(
      (f, i) => new THREE.Vector3(i * 5 - (frequencyData.length * 5) / 2, f, 0),
    );
  });

  return useMemo(() => {
    return (
      <mesh position={[0, -800, -1000]}>
        <meshLine ref={meshRef} attach="geometry" />
        <meshLineMaterial attach="material" lineWidth={10} color={color} />
      </mesh>
    );
  }, []);
});

export const barsConfig = {
  Contents: Bars,
  CustomEffects: Effects,
  params: {
    name: 'bars' as const,
  },
};

export default function BarsPage() {
  const [started, start] = useState(false);

  const config: Config<unknown> = {
    ...barsConfig,
    params: {
      ...defaultConfig,
      ...barsConfig.params,
      audioEnabled: true,
      zoomThreshold: 2,
      trails: 125,
    },
  };
  return started ? (
    <Mixer config={config} />
  ) : (
    <Page onClick={() => start(true)}>
      <div>Click to start</div>
    </Page>
  );
}
