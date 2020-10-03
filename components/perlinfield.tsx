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
  // p.z *= sin(time + p.x/10.) + 2.;
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

const length = 100;
const width = 100;
const zoom = 8;
const zoomX = zoom;
const zoomY = zoom;
const speed = 1;
const planeSize = 1000;

const index = (x: number, y: number) => y * (length + 1) + x;

function Scene() {
  let i = 0;

  const planeRef = useRef<THREE.PlaneBufferGeometry>();
  const lightRef = useRef<THREE.SpotLight>();
  const shaderRef = useRef<THREE.ShaderMaterial>();
  const noiseFunction = makeNoise2D(Date.now());
  const noise = (x: number, y: number) => {
    return (
      Math.min(noiseFunction((x * zoomX) / length, (y * zoomY) / width), 0.15) *
      100
    );
  };

  const { clock } = useThree();

  useEffect(() => {
    const plane = planeRef.current!;
    const { position } = plane.attributes;
    for (let x = 0; x < length + 1; x++) {
      for (let y = 0; y < width + 1; y++) {
        position.setZ(index(x, y), noise(x, y));
      }
    }
    plane.computeVertexNormals();
  }, []);

  useFrame(() => {
    i++;
    shaderRef.current!.uniforms.time.value = clock.elapsedTime;
    const plane = planeRef.current!;

    plane.translate(0, planeSize / length / speed, 0);

    if (i % speed !== 0) return;
    const { position } = plane.attributes;

    for (let y = 0; y < width; y++) {
      for (let x = 0; x < length + 1; x++) {
        const z = position.getZ(index(x, y + 1));
        position.setY(index(x, y), position.getY(index(x, y + 1)));
        position.setZ(index(x, y), z);
      }
    }
    for (let x = 0; x < length + 1; x++) {
      position.setY(
        index(x, width),
        position.getY(index(x, width)) - planeSize / length,
      );
      position.setZ(index(x, width), noise(x, width + i / speed));
    }
    position.needsUpdate = true;
    plane.computeVertexNormals();
  });

  return (
    <>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeBufferGeometry
          ref={planeRef}
          args={[planeSize, planeSize, length, width]}
        />
        <shaderMaterial ref={shaderRef} color={'blue'} args={[Shader]} />
      </mesh>
      <spotLight ref={lightRef} castShadow position={[0, 500, 0]} />
    </>
  );
}

export default function PerlinField() {
  return (
    <Container>
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [0, 300, 500], far: 10000 }}
        shadowMap={true}
      >
        <Scene />
        <OrbitControls />
      </Canvas>
    </Container>
  );
}
