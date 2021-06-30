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

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)

void main()
{
    vec2 position = vUv * 2. - 1.;
    position.x *= aspect;

    float noise = snoise2(vec2(vUv.x*25., time/10.))/40.;
    noise += texture2D(audio, vec2(vUv.x, 0.0)).r/10.;

    float p = vUv.y+noise+time/20.;
    float d = mod(p, s);

    vec3 color = d < 0.003 ? vec3(0.) : hsv2rgb(vec3((p-d)*10., 1.0, 1.0));

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
