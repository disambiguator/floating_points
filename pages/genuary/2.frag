#ifdef GL_ES
precision highp float;
#endif
uniform float aspect;
uniform float time;
uniform sampler2D tDiffuse;
uniform float threshold;
varying vec2 vUv;

// #pragma glslify: dither = require(glsl-dither)
#pragma glslify: dither = require(glsl-dither/8x8)
// #pragma glslify: dither = require(glsl-dither/4x4)
// #pragma glslify: dither = require(glsl-dither/2x2)

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 coord = vUv;

  vec2 dxy = 10.0 / vec2(1000.0 * sin(time));
  // coord = dxy * floor( vUv / dxy );

  vec4 color = texture2D(tDiffuse, coord);
  // color.xyz = step(rand(vUv) + threshold, color.xyz);
  color.xyz = dither(gl_FragCoord.xy + time * 5.0, color.xyz + threshold);
  gl_FragColor = color;
}
