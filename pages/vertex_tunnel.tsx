import { useFrame } from '@react-three/fiber';
import glsl from 'glslify';
import { Perf } from 'r3f-perf';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Page from '../components/page';
import { FiberScene } from '../components/scene';

const tunnelWidth = 300.0;

const Vertices = () => {
  const matRef = useRef<THREE.MeshLambertMaterial>();
  const shaderRef = useRef<THREE.Shader>();

  useFrame(() => {
    const shader = shaderRef.current;
    if (shader) shader.uniforms.time.value += 3;
  });

  useEffect(() => {
    matRef.current!.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      const token = '#include <begin_vertex>';
      const customTransform = `
          vec3 transformed = vec3(position);
          float d = 0.3;
          float r = 100.0;
          float theta = atan(transformed.z/transformed.x);
          float displacement = snoise2(vec2(theta*20., (position.y+time)/20.)/20.) * d;
          transformed += displacement * transformed;

          `;

      const token2 = '#include <common>';
      const customGlsl = glsl`
      #include <common>
      #pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
      uniform float time;

      `;
      shader.vertexShader = shader.vertexShader
        .replace(token, customTransform)
        .replace(token2, customGlsl);

      console.log(shader.fragmentShader);

      shaderRef.current = shader;
    };
  }, []);

  return (
    <>
      <pointLight args={['white', 100000, 0]} position={[0, 0, 0]} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[tunnelWidth, tunnelWidth, 200, 200]} />
        <meshPhongMaterial
          ref={matRef}
          color={new THREE.Color(242 / 255, 142 / 255, 92 / 255)}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

export default function VertexStudyPage() {
  return (
    <Page>
      <FiberScene
        controls
        shadows
        camera={{ far: 10000, position: [0, 0, 300] }}
      >
        <Vertices />
        <Perf />
      </FiberScene>
    </Page>
  );
}
