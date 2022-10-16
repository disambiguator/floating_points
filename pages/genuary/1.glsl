#ifdef GL_ES
precision highp float;
#endif
uniform float aspect;
uniform sampler2D tDiffuse;
varying vec2 vUv;

#pragma glslify: kaleidoscope = require(../../lib/shaders/kaleidoscope.glsl)

void main() {
  vec2 coord = vUv;

  // Shift to -1 to 1 coordinate system
  coord = coord * 2.0 - 1.0;

  coord = kaleidoscope(coord, 2.0);

  // Get old frame (in 0 to 1 coordinate system)
  coord = (coord + 1.0) / 2.0;

  gl_FragColor = texture2D(tDiffuse, coord);
}
