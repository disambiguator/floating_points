import { Vector3 } from 'three';
import vertexShader from 'lib/shaders/defaultForwardUV.vert';

const DusenShader = {
  vertexShader,
  fragmentShader: /* glsl */ `
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform float aspect;
  uniform float time;
  uniform float radius;
  uniform vec3 color;

  in vec2 vUv;

  float circ(vec2 p, float radius) {
      return step(length(p - 0.5), radius);
  }

  float distanceBetween = 0.8;

  vec3 shapes(vec2 position, vec3 color) {
      position = mod(position, distanceBetween);
      float inCircle = circ(position, radius);

      return color * inCircle;
  }

  void main()
  {
      vec2 position = vUv * 2. - 1.;
      position.x *= aspect;

    //   gl_FragColor = abs(length(position) - time) < 0.002 ? vec4(color, 1.0) : vec4(0.);
      gl_FragColor = abs(time - vUv.y) < 0.003 ? vec4(color, 1.0) : vec4(0.);
  }
      `,

  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    radius: { value: 0.15 },
    color: { value: new Vector3() },
  },
};

export default DusenShader;
