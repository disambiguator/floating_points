import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import { ShaderMaterial, Vector3 } from 'three';
import { useStateUpdate, useStore } from '../lib/store';
import Mixer, { BaseConfig, defaultConfig, scaleMidi } from './mixer';

interface SortConfig extends BaseConfig {
  sortMode: 'sort' | 'random';
}

export const Sort = ({ config }: { config: SortConfig }) => {
  const { color, noiseAmplitude } = useStore(({ color, noiseAmplitude }) => ({
    color,
    noiseAmplitude,
  }));
  const { sortMode } = config;
  const arrayLength = Math.floor(scaleMidi(noiseAmplitude, 1, 500));
  const shaderRef = useRef<ShaderMaterial>();

  const randData = () =>
    Array(arrayLength)
      .fill(undefined)
      .map(() => Math.random());

  const Shader = {
    vertexShader: /* glsl */ `
    varying vec2 vUv;

      void main() {

      vUv = uv;
      gl_Position = projectionMatrix *
        modelViewMatrix *
        vec4(position,1.0);
      }
  `,

    fragmentShader: /* glsl */ `
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform int arrayLength;
  uniform float time;
  uniform float stripes[${arrayLength}];
  uniform vec3 colors[${arrayLength}];

  varying vec2 vUv;

  void main()
  {
      vec3 color;
      int i = int(vUv.x*float(arrayLength));

      for (int k = 0; k < arrayLength; ++k) {
        if (i == k)
           color = vUv.y/stripes[k] * colors[k] * step(vUv.y, stripes[k]);
      }


      gl_FragColor = vec4(color, 1.0);
  }
      `,

    uniforms: {
      time: { value: 0.0 },
      stripes: { value: randData() },
      arrayLength: { value: arrayLength },
      colors: {
        value: Array(arrayLength)
          .fill(undefined)
          .map(() =>
            color
              ? // ? new Vector3(Math.random(), Math.random(), Math.random())
                Math.random() > 0.5
                ? new Vector3(1, 0, 0)
                : new Vector3(0, 0, 1)
              : new Vector3(1, 1, 1),
          ),
      },
    },
  };

  let index = 0;
  useFrame(() => {
    const currentStripes = shaderRef.current!.uniforms.stripes.value;

    if (sortMode === 'sort') {
      if (index >= arrayLength) {
        shaderRef.current!.uniforms.stripes.value = randData();
        index = 0;
      }
      const oldValue = currentStripes[index];
      const subset = currentStripes.slice(index);
      const minValue = Math.min(...subset);
      const minIndex = currentStripes.indexOf(minValue);
      currentStripes[index] = minValue;
      currentStripes[minIndex] = oldValue;
      index++;
    } else if (sortMode === 'random') {
      const indexOne = Math.floor(Math.random() * arrayLength);
      const indexTwo = Math.floor(Math.random() * arrayLength);
      const valueOne = currentStripes[indexOne];
      const valueTwo = currentStripes[indexTwo];
      currentStripes[indexOne] = valueTwo;
      currentStripes[indexTwo] = valueOne;
    }
  });

  return (
    <>
      <mesh position={[0, 0, -600]}>
        <planeGeometry args={[1000, 1000]} />
        <shaderMaterial ref={shaderRef} args={[Shader]} />
      </mesh>
    </>
  );
};

export const sortConfig = {
  params: { name: 'sort' as const },
  Contents: Sort,
};

export default function SortPage() {
  useStateUpdate({
    color: true,
    zoomThreshold: 1,
    noiseAmplitude: 50,
    trails: 115,
  });

  return (
    <Mixer
      config={{
        ...sortConfig,
        params: {
          ...defaultConfig,
          ...sortConfig.params,
          sortMode: 'sort',
        },
      }}
    />
  );
}
