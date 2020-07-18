import React, { useRef } from 'react';
import Page from './page';
import { useFrame, Canvas } from 'react-three-fiber';
import { ShaderMaterial } from 'three';

const Sketch = () => {
  const arrayLength = 1000;

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

  varying vec2 vUv;

  void main()
  {
      float color;
      int i = int(vUv.x*float(arrayLength));

      for (int k = 0; k < arrayLength; ++k) {
        if (i == k)
           color = vUv.y/stripes[k] * step(vUv.y, stripes[k]);
      }


      gl_FragColor = vec4(vec3(color), 1.0);
  }
      `,

    uniforms: {
      time: { value: 0.0 },
      stripes: { value: randData() },
      arrayLength: { value: arrayLength },
    },
  };

  let index = 0;

  useFrame(() => {
    if (index >= arrayLength) {
      shaderRef.current!.uniforms.stripes.value = randData();
      index = 0;
    }
    const currentStripes = shaderRef.current!.uniforms.stripes.value;
    const oldValue = currentStripes[index];
    const subset = currentStripes.slice(index);
    const minValue = Math.min(...subset);
    const minIndex = currentStripes.indexOf(minValue);
    currentStripes[index] = minValue;
    currentStripes[minIndex] = oldValue;
    index++;
  });

  console.log('rendering');
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} attach="geometry" />
        <shaderMaterial ref={shaderRef} args={[Shader]} attach="material" />
      </mesh>
    </>
  );
};

export default () => {
  return (
    <Page>
      <Canvas
        gl2
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 1000], far: 10000 }}
      >
        <Sketch />
      </Canvas>
    </Page>
  );
};
