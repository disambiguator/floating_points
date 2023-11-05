#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
uniform float time;
uniform float radius;
uniform sampler2D audio;
uniform float s;
in vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: hsv2rgb = require(glsl-hsv2rgb)

const float PI = 3.14156;

vec3 blob(vec2 position) {
  float noise = snoise2(vec2(position.x * 15.0, 1.0)) / 10.0;
  // noise += texture2D(audio, vec2(position.x, 0.0)).r/15.;

  float p = 1.0 - (position.y + sin(position.x * PI) / 2.0 + noise);
  p *= step(p, s * 8.0);
  float d = mod(p, s);

  vec3 color = d < 0.003 ? vec3(0.0) : hsv2rgb(vec3((p - d) * 10.0, 1.0, 1.0));

  return color;
}

void main() {
  vec2 position = vUv;
  position.x *= aspect;

  vec3 color = blob(position);
  gl_FragColor = vec4(color, 1.0);
}
