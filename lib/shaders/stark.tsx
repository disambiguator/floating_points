import glsl from 'glslify';
import * as THREE from 'three';

const StarkShader = {
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
uniform sampler2D audio;
uniform float s;
varying vec2 vUv;

const float PI = 3.14156;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)

vec3 blob(vec2 position) {
  float noise = snoise2(vec2(position.x*15., 1.0))/10.;
  // noise += texture2D(audio, vec2(position.x, 0.0)).r/15.;

  float p = 1. - (position.y+sin(position.x*PI)/2.+noise);
  p *= step(p,s*8.);
  float d = mod(p, s);

  vec3 color = d < 0.003 ? vec3(0.) : hsv2rgb(vec3((p-d)*10., 1.0, 1.0));

  return color;
}

void main() {
  vec2 position = vUv;
  position.x *= aspect;

  vec3 color = blob(position);
  gl_FragColor = vec4(color, 1.0);
}
    `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    s: { value: 0.04 },
    audio: {
      value: new THREE.DataTexture(new Uint8Array([0]), 0, 1, THREE.RedFormat),
    },
  },
};

export default StarkShader;
