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

void main() {
  vec2 position = vUv * 2.0 - 1.0;
  position.x *= aspect;

  float noise = snoise2(vec2(vUv.x * 25.0, time / 10.0)) / 40.0;
  noise += texture2D(audio, vec2(vUv.x, 0.0)).r / 10.0;

  float p = vUv.y + noise + time / 20.0;
  float d = mod(p, s);

  vec3 color = d < 0.003 ? vec3(0.0) : hsv2rgb(vec3((p - d) * 10.0, 1.0, 1.0));

  gl_FragColor = vec4(color, 1.0);
}
