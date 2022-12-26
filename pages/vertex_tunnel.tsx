import { useFrame } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import customGlsl from 'lib/shaders/vertexTunnel.glsl';
import Page from '../components/page';
import { FiberScene } from '../components/scene';

const tunnelWidth = 300.0;

interface CustomShader extends THREE.ShaderMaterial {
  uniforms: { time: { value: number } };
}

const Vertices = () => {
  const matRef = useRef<THREE.MeshPhongMaterial>(null);
  const shaderRef = useRef<CustomShader>();

  useFrame(() => {
    const shader = shaderRef.current;
    if (shader) shader.uniforms.time.value += 3;
  });

  useEffect(() => {
    matRef.current!.onBeforeCompile = (shader: CustomShader) => {
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
      shader.vertexShader = shader.vertexShader
        .replace(token, customTransform)
        .replace(token2, customGlsl);

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
