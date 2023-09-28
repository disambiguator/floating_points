#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
// uniform float trailNoiseAmplitude;
uniform float trailNoiseFrequency;
uniform float time;
uniform float aberration;
uniform vec2[100] circle;
uniform float[100] circleTime;
uniform int numCircles;

in vec2 vUv;

// #pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

vec3 circ(vec2 p, float radius) {
  for (int i = 0; i < 100; i++) {
    if (i >= numCircles) return vec3(0.0);
    float trailNoiseAmplitude = time - circleTime[i];
    // float trailNoiseFrequency = (time - circleTime[i]) / 1000.0;
    if (trailNoiseAmplitude > 0.0 && trailNoiseFrequency > 0.0) {
      vec2 pos =
        p +
        trailNoiseAmplitude *
          vec2(
            snoise3(trailNoiseFrequency * vec3(p.x, p.y, time / 50.0)),
            snoise3(time + trailNoiseFrequency * vec3(p.x, p.y, time / 50.0))
          );
      if (length(pos - circle[i]) < radius) {
        return vec3(5.0 - (time - circleTime[i]));
      }
    }
  }

  return vec3(0.0);
}

void main() {
  vec2 position = vUv;
  position = position * 2.0 - 1.0;
  position.x *= aspect;

  // if (abs(position.x) > 0.99 * aspect || abs(position.y) > 0.99) {
  //   gl_FragColor = vec4(1.0);
  //   return;
  // }

  // float trailNoiseAmplitude = 0.1;
  // float trailNoiseFrequency = 0.1;

  // float aberration = 0.01;
  vec3 color = circ(position, 0.1);
  if (aberration > 0.0) {
    color = vec3(
      circ(position + vec2(aberration), 0.1).r,
      circ(position + vec2(-aberration), 0.1).r,
      circ(position + vec2(aberration, -aberration), 0.1).r
    );
  }
  gl_FragColor = vec4(color, 1.0);
}
