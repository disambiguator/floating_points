#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
uniform float time;

float noise(vec2 pos) {
  return snoise2(pos.xy / 20.0) * 10.0;
}
