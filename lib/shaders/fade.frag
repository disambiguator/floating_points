#ifdef GL_ES
precision highp float;
#endif

uniform float aspect;
// uniform float trailNoiseFrequency;
uniform float time;
uniform float aberration;
uniform vec2[100] circle;
uniform float[100] circleTime;
uniform vec3[100] circleColor;
uniform int numCircles;

in vec2 vUv;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

vec3 circ(vec2 p, float radius) {
  for (int i = 0; i < 100; i++) {
    if (i >= numCircles) return vec3(0.0);
    float trailNoiseFrequency = mod(circleTime[i] * 2.0, 5.0) + 5.0;
    float trailNoiseAmplitude = time - circleTime[i];
    if (trailNoiseAmplitude > 0.0 && trailNoiseFrequency > 0.0) {
      float movement = time / 20.0;
      vec2 pos =
        p +
        trailNoiseAmplitude *
          vec2(
            snoise3(
              trailNoiseFrequency * vec3(p.x, p.y, circleTime[i] + movement)
            ),
            snoise3(
              time +
                trailNoiseFrequency * vec3(p.x, p.y, circleTime[i] + movement)
            )
          );
      if (length(pos - circle[i]) < radius) {
        return circleColor[i] * (5.0 - (time - circleTime[i]));
      }
    }
  }

  return vec3(0.0);
}

void main() {
  vec2 position = vUv * 2.0 - 1.0;
  position.x *= aspect;

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
