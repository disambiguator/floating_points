import { useFrame } from '@react-three/fiber';
import glsl from 'glslify';
import { useControls } from 'leva';
import React, { useRef } from 'react';
import * as THREE from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';

const Shader = {
  vertexShader: glsl`
    #ifdef GL_ES
    precision highp float;
    #endif

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
    uniform float posScale;
    uniform float time;
    uniform float striations;
    uniform float height;
    float noise(vec2 pos, float scaling) {
        return snoise3(vec3(pos/posScale, 1.)) * scaling;
    }
    varying vec3 color;

    void main() {
        vec3 p = position;
        float scaling = height * (length(p.xy))/100.;
        p.z = noise(p.xy, scaling);
        // color = vec3(p.z/scaling);
        float l = mod(length(p.xy),striations) * 10./striations;
        if(l > 10.*2./3.) {
          color = vec3(103.,119.,68.);
        } else if (l > 10./3.) {
          color = vec3(188.,189.,139.);
        } else {
          color = vec3(138.,97.,63.);
        }
        color /= 255.;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }
  `,
  fragmentShader: `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 color;
    void main() {
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  uniforms: {
    posScale: new THREE.Uniform(0),
    striations: new THREE.Uniform(0),
    time: new THREE.Uniform(0),
    height: new THREE.Uniform(0),
  },
};

const Scene = React.memo(function Scene() {
  const ref = useRef<THREE.ShaderMaterial>();
  const { posScale, striations, height } = useControls({
    posScale: { value: 30, min: 0, max: 60 },
    striations: { value: 30, min: 0, max: 50 },
    height: { value: 30, min: 0, max: 200 },
  });
  useFrame(({ clock }) => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 1000, 1000]} />
        <shaderMaterial
          ref={ref}
          args={[Shader]}
          side={THREE.DoubleSide}
          uniforms-posScale-value={posScale}
          uniforms-striations-value={striations}
          uniforms-height-value={height}
        />
      </mesh>
    </>
  );
});

export default function Fifteen() {
  return (
    <Page>
      <FiberScene frameloop="demand" controls camera={{ position: [0, 90, 0] }}>
        <Scene />
      </FiberScene>
    </Page>
  );
}
