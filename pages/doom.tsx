import { useFrame, useThree } from '@react-three/fiber';
import glsl from 'glslify';
import React, { useRef } from 'react';
import { DataTexture, RedFormat, ShaderMaterial } from 'three';
import * as THREE from 'three';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
const textureSize = 512;

const shader = {
  vertexShader: /* glsl */ `
  varying vec2 vUv;

    void main() {

    vUv = uv;
    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(position,1.0);
    }
`,

  fragmentShader: glsl`
#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
uniform float time;
uniform float radius;
uniform sampler2D noise;
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

float noise_f(vec2 pos) {
  // return snoise2(vec2(pos.x, 10.));
  return texture2D(noise, vec2(pos.x, 1.)).r;
}

void main()
{
    float t = time/10.;

    vec2 pos = vUv;
    pos.y += noise_f(pos) + t ;
    pos.x += noise_f(pos) + t * 10.;

    pos = mod(pos, 1.);

    vec3 color =
    //  pos.y > 1.
      // ? vec3(0.) :
       vec3(pos.x, pos.y, mix(pos.x,pos.y, snoise2(vec2(time, 1.))));

    // vec3 color = vec3(texture2D(noise, vUv).r);

    gl_FragColor = vec4(color, 1.0);
}
    `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    noise: {
      value: new THREE.DataTexture(new Uint8Array([0]), 0, 1, THREE.RedFormat),
    },
  },
};
const Shaders = React.memo(function Shader() {
  const { viewport, size } = useThree();
  const ref = useRef<ShaderMaterial>();
  useFrame(({ clock }) => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });

  const onClick = () => {
    const size = Math.floor(1000 * Math.random());

    ref.current!.uniforms.noise.value = new DataTexture(
      new Uint8Array(
        new Array(size).fill(undefined).map(() => {
          return Math.random() * 255;
        }),
      ),
      size,
      1,
      RedFormat,
    );
  };

  return (
    <mesh position={[0, 0, -215]} onClick={onClick}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-noise-value={
          new DataTexture(
            new Uint8Array(
              new Array(textureSize).fill(undefined).map(() => {
                return Math.random() * 255;
              }),
            ),
            textureSize,
            1,
            RedFormat,
          )
        }
      />
    </mesh>
  );
});

export default function ShaderPage() {
  return (
    <Page>
      <FiberScene controls>
        <Shaders />
      </FiberScene>
    </Page>
  );
}
