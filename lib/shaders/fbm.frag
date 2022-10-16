#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
uniform float time;
uniform float radius;
uniform float G;
varying vec2 vUv;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

const int numOctaves = 8;
const float timeScale = 500.0;

float fbm(
  vec2 x //, in float H )
) {
  float f = 3.0;
  float a = 1.0;
  float t = 0.0;
  float tt = time / timeScale;

  for (int i = 0; i < numOctaves; i++) {
    t += a * (snoise3(f * vec3(x.x, x.y, tt)) / 2.0 + 0.3);
    f *= 2.0;
    a *= G;
  }
  return t;
}

void main() {
  float t = time / timeScale;
  vec2 position = vUv * 2.0 - 1.0;
  position.x *= aspect;
  position.y += t;
  position /= 4.0;

  float fbm_p = fbm(position + vec2(0.0, 0.0));
  vec2 q = vec2(fbm_p);

  gl_FragColor = vec4(vec3(fbm(position + 4.0 * q)), 1.0);
}
