#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
uniform float posScale;
uniform float time;
uniform float striations;
uniform float height;
float noise(vec2 pos, float scaling) {
  return snoise3(vec3(pos / posScale, 1.0)) * scaling;
}
out vec3 color;

void main() {
  vec3 p = position;
  float scaling = height * length(p.xy) / 100.0;
  p.z = noise(p.xy, scaling);
  // color = vec3(p.z/scaling);
  float l = mod(length(p.xy), striations) * 10.0 / striations;
  if (l > 10.0 * 2.0 / 3.0) {
    color = vec3(103.0, 119.0, 68.0);
  } else if (l > 10.0 / 3.0) {
    color = vec3(188.0, 189.0, 139.0);
  } else {
    color = vec3(138.0, 97.0, 63.0);
  }
  color /= 255.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
