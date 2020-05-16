import React, { useMemo, useRef } from 'react';
import Mixer, { BaseConfig, Config, defaultConfig } from './mixer';
import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ReactThreeFiber, useFrame } from 'react-three-fiber';
import { extend } from 'react-three-fiber';
// @ts-ignore
import { MeshLine, MeshLineMaterial } from 'threejs-meshline';

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

export interface BarsConfig extends BaseConfig {
  contents: 'bars';
}

const width = 5;
const color = 'red';
export const Bars = React.memo(({ config }: { config: Config }) => {
  const meshRef = useRef<MeshLine>();
  useFrame(() => {
    if (config.frequencyData) {
      meshRef.current!.vertices = config.frequencyData.map(
        (f, i) =>
          new THREE.Vector3(
            i * 5 - (config.frequencyData.length * 5) / 2,
            f,
            0,
          ),
      );
    }
  });

  return useMemo(() => {
    const vertices = [1, 2, 3].map(
      (f, i) => new THREE.Vector3(i * 50, f * 100, 0),
    );

    return (
      <mesh>
        <meshLine ref={meshRef} attach="geometry" vertices={vertices} />
        <meshLineMaterial attach="material" lineWidth={width} color={color} />
      </mesh>
    );
  }, []);
});

export default () => {
  const config: BarsConfig = {
    ...defaultConfig,
    contents: 'bars',
  };
  return <Mixer config={config} />;
};
