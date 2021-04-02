import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Page from '../components/page';
import { FiberScene } from '../components/scene';

const floorShader = {
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

varying vec2 vUv;
uniform float time;

void main()
{
    vec2 position = vUv + mod(time/500., 0.005);
    float stripe = mod(position.x, 0.005) < 0.0002 || mod(position.y, 0.005) < 0.0002 ? 0. : 1.;
    gl_FragColor = vec4(vec3(stripe), 1.0);
}
    `,

  uniforms: {
    time: new THREE.Uniform(0.0),
  },
};

const generateWallColors = () => {
  const height = 500;

  const values = new Float32Array(height * 3);
  for (let i = 0; i < height * 3; i++) {
    values[i] = Math.random() * 1.0;
  }

  return new THREE.DataTexture(
    values,
    1,
    height,
    THREE.RGBFormat,
    THREE.FloatType,
  );
};

const VDC = () => {
  const floorMeshRef = useRef<THREE.Mesh>();
  const wallMeshRef = useRef<THREE.Mesh>();
  const floorShaderRef = useRef<THREE.ShaderMaterial>();
  const wallMaterialRef = useRef<THREE.MeshBasicMaterial>();

  const { clock } = useThree();

  useEffect(() => {
    const floorMesh = floorMeshRef.current!;
    floorMesh.rotation.x -= Math.PI / 2;

    const wallMesh = wallMeshRef.current!;
    wallMesh.rotation.y -= Math.PI / 2;
  }, []);

  useFrame(() => {
    const floorShader = floorShaderRef.current!;
    floorShader.uniforms.time.value = clock.elapsedTime;

    const wallMaterial = wallMaterialRef.current!;
    wallMaterial.map = generateWallColors();
  });

  return (
    <>
      <mesh ref={floorMeshRef} position={[0, -100, 0]}>
        <planeGeometry args={[10000, 10000]} />
        <shaderMaterial ref={floorShaderRef} args={[floorShader]} />
      </mesh>
      <mesh ref={wallMeshRef} position={[200, -100, 0]}>
        <planeGeometry args={[10000, 10000]} />

        <meshBasicMaterial ref={wallMaterialRef} />
      </mesh>
    </>
  );
};

export default function VdcPage() {
  return (
    <Page>
      <div style={{ height: 1000, width: 1000 }}>
        <FiberScene camera={{ far: 10000, position: [0, 0, 30], fov: 150 }}>
          <VDC />
        </FiberScene>
      </div>
    </Page>
  );
}
