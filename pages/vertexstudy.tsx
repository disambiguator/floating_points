import React, { useRef, useEffect } from 'react';
import { useFrame, useResource } from 'react-three-fiber';
import Page from '../components/page';
import * as THREE from 'three';
import glsl from 'glslify';
import { FiberScene } from '../components/scene';
import { Perf } from 'r3f-perf';
import { Box } from '@react-three/drei';

const Vertices = () => {
  const matRef = useRef<THREE.MeshLambertMaterial>();
  const pointLight = useResource<THREE.PointLight>();
  const groupRef = useResource<THREE.Group>();
  const shaderRef = useRef<THREE.Shader>();

  useFrame(() => {
    const shader = shaderRef.current;
    if (shader) shader.uniforms.time.value += 3;

    groupRef.current.rotation.y += 0.01;
  });

  useEffect(() => {
    matRef.current!.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      const token = '#include <begin_vertex>';
      const customTransform = `
          vec3 transformed = vec3(position);
          float d = 0.0;
          // float d = transformed.y + 500.0 - mod(time, 1000.0);
          d += transformed.x;
          transformed.z = snoise2(vec2(position.x, position.y + time/10.)/30.) * d * d/100.;
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

      shaderRef.current = shader;
    };
  }, []);

  return (
    <>
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[300, 1000, 200, 200]} />
        <meshPhongMaterial
          ref={matRef}
          color={new THREE.Color(242 / 255, 142 / 255, 92 / 255)}
        />
      </mesh>
      <Box args={[10, 10, 10]} position={[0, 10, 0]} castShadow>
        <meshPhongMaterial attach="material" color="white" />
      </Box>
      <group ref={groupRef}>
        <spotLight ref={pointLight} position={[0, 140, 300]} castShadow />
      </group>
    </>
  );
};

export default function VertexStudyPage() {
  return (
    <Page>
      <FiberScene
        controls
        shadowMap
        camera={{ far: 10000, position: [0, 0, 300] }}
      >
        <Vertices />
        <Perf />
      </FiberScene>
    </Page>
  );
}
