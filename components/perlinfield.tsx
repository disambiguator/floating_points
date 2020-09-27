import { OrbitControls } from 'drei';
import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import styled from 'styled-components';
import * as THREE from 'three';
import { makeNoise2D } from 'open-simplex-noise';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background: black;
`;

const Shader = {
  vertexShader: /* glsl */ `
    #define PHONG
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
	vNormal = normalize( transformedNormal );
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

  vec3 p = position;
  // p.z *= sin(time) + 2.;
  gl_Position = projectionMatrix *
  modelViewMatrix *
  vec4(p,1.0);
}
`,
  fragmentShader: THREE.ShaderLib.phong.fragmentShader,
  uniforms: THREE.UniformsUtils.merge([
    THREE.ShaderLib.phong.uniforms,
    { time: { value: 0.0 } },
  ]),
  lights: true,
};

function Scene() {
  const length = 300;
  const width = 300;
  let i = 0;

  const planeRef = useRef<THREE.PlaneBufferGeometry>();
  const lightRef = useRef<THREE.SpotLight>();
  const shaderRef = useRef<THREE.ShaderMaterial>();
  const noise = makeNoise2D(Date.now());
  const { clock } = useThree();

  useEffect(() => {
    const { position } = planeRef.current!.attributes;
    for (let x = 0; x < length + 1; x++) {
      for (let y = 0; y < width + 1; y++) {
        const z = noise(x / 20, y / 20);
        position.setZ(y * (length + 1) + x, z * 40);
      }
    }
  }, []);

  useFrame(() => {
    i++;
    const { position } = planeRef.current!.attributes;
    for (let x = 0; x < length + 1; x++) {
      for (let y = 0; y < width + 1; y++) {
        const z =
          y === width
            ? noise(x / 20, (width + i) / 20) * 40
            : position.getZ((y + 1) * (length + 1) + x);

        position.setZ(y * (length + 1) + x, z);
      }
    }
    position.needsUpdate = true;
    // const light = lightRef.current!;
    // light.position.y =
    //   50 * Math.sin((clock.elapsedTime * Math.PI) / 2 / 2) + 50;
    shaderRef.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeBufferGeometry ref={planeRef} args={[300, 300, length, width]} />
        <shaderMaterial ref={shaderRef} color={'blue'} args={[Shader]} />
      </mesh>
      <spotLight ref={lightRef} castShadow position={[0, 100, 0]} />
    </>
  );
}

export default function PerlinField() {
  return (
    <Container>
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [0, 100, 100], far: 10000 }}
        shadowMap={true}
      >
        <Scene />
        <OrbitControls />
      </Canvas>
    </Container>
  );
}
