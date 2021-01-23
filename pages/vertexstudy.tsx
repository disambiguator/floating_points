import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from 'react-three-fiber';
import Page from '../components/page';
import * as THREE from 'three';
import glsl from 'glslify';
import { FiberScene } from '../components/scene';
import { Perf } from 'r3f-perf';

const Shader = {
  vertexShader: glsl`
  #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

  varying vec3 vPos;
  varying vec3 vNormal;
  uniform float time;

  void main() {
    vec3 p = position;
    p.z = snoise3((position + time/10.)/30.) * 20.;
    // p.z += 10. * sin(position.y/10. + time/10.);

    vPos = (modelMatrix * vec4(p, 1.0 )).xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
  }
`,

  fragmentShader: glsl`
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 diffuse;
varying vec3 vPos;
varying vec3 vNormal;

struct PointLight {
  vec3 position;
  vec3 color;
};
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

void main() {
vec4 addedLights = vec4(242. / 255., 142. / 255., 92. / 255., 1.0)/10.;
for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
vec3 adjustedLight = pointLights[l].position + cameraPosition;
vec3 lightDirection = normalize(vPos - adjustedLight);
addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * pointLights[l].color;
}
gl_FragColor = addedLights;
// mix(vec4(diffuse.x, diffuse.y, diffuse.z, 1.0), addedLights, addedLights);
}
    `,

  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib['lights'],
    {
      diffuse: { type: 'c', value: new THREE.Color(0xff00ff) },
      time: { type: 'float', value: 0.0 },
    },
  ]),
};
const Vertices = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>();

  useFrame(() => {
    shaderRef.current!.uniforms.time.value++;
  });

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[100, 100, 500, 500]} />
        <shaderMaterial
          args={[Shader]}
          ref={shaderRef}
          side={THREE.DoubleSide}
          lights
        />
      </mesh>
      <pointLight position={[0, -20, 20]} />
    </>
  );
};

export default function VertexStudyPage() {
  return (
    <Page>
      <FiberScene controls camera={{ far: 10000, position: [0, 0, 300] }}>
        <Vertices />
        <Perf />
      </FiberScene>
    </Page>
  );
}
