import React from 'react';
import * as THREE from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import shaderChunk from './15.glsl';

function buildTwistMaterial() {
  const material = new THREE.MeshNormalMaterial();
  material.onBeforeCompile = function (shader) {
    shader.uniforms['time'] = { value: 0 };

    shader.vertexShader = shaderChunk + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        vec3 transformed = position;
        transformed.z = noise(position.xy);
        vNormal = normalize(
            vec3(
                noise(vec2(position.x + 1., position.y)) - noise(position.xy),
                // noise(vec2(position.x, position.y + 1.)) - noise(position.xy),
                1.,
                0.
                )
            );
      `,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    material.userData.shader = shader;
  };

  // Make sure WebGLRenderer doesnt reuse a single program

  material.customProgramCacheKey = function () {
    return 'dsjdhas';
  };

  return material;
}

const Scene = React.memo(function Scene() {
  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      material={buildTwistMaterial()}
    >
      <planeGeometry args={[100, 100, 100, 100]} />
    </mesh>
  );
});

export default function Fifteen() {
  return (
    <Page>
      <FiberScene controls camera={{ position: [0, 20, 1000] }}>
        <Scene />
      </FiberScene>
    </Page>
  );
}
