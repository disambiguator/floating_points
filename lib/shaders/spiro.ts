import * as THREE from 'three';

export default {
  uniforms: {
    amplitude: new THREE.Uniform(0.0),
    origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    color: new THREE.Uniform(0.0),
  },

  vertexShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float amplitude;
    uniform vec3 origin;
    uniform vec3 direction;
    uniform float color;
    attribute float displacement;

    varying vec3 vPosition;
    varying float vColor;

    float computeDistance(vec3 mouseOrigin, vec3 mouseDirection, vec3 vertexPosition) {
      vec3 d = normalize(mouseDirection);
      vec3 v = vertexPosition - mouseOrigin;
      float t = dot(v, d);
      vec3 P = mouseOrigin + t * d;
      return distance(P, vertexPosition);
    }

    void main() {

    vPosition = position;
    vColor = color;

    vec3 newPosition = position + amplitude * displacement * pow(computeDistance(origin, direction, position),2.) * direction;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition,1.0);
    }
`,

  fragmentShader: /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif

// same name and type as VS
varying vec3 vPosition;
varying float vColor;

void main() {

vec3 color = vColor * normalize(vPosition) + (1. - vColor) * vec3(1.0);

// feed into our frag colour
gl_FragColor = vec4(color, 1.0);

}
`,
};
