import * as THREE from 'three';

const spiroShader = {
  uniforms: {
    amplitude: new THREE.Uniform(0.0),
    origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    color: new THREE.Uniform(0.0),
    time: new THREE.Uniform(0),
  },

  vertexShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float amplitude;
    uniform vec3 origin;
    uniform vec3 direction;
    attribute float displacement;

    varying vec4 vPosition;

    float computeDistance(vec3 mouseOrigin, vec3 mouseDirection, vec3 vertexPosition) {
      vec3 d = normalize(mouseDirection);
      vec3 v = vertexPosition - mouseOrigin;
      float t = dot(v, d);
      vec3 P = mouseOrigin + t * d;
      return distance(P, vertexPosition);
    }

    void main() {

    vec3 newPosition = position + amplitude * displacement * pow(computeDistance(origin, direction, position),2.) * direction;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition,1.0);
    vPosition = normalize(gl_Position);
    }
`,

  fragmentShader: /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif

// same name and type as VS
varying vec4 vPosition;
uniform bool color;
uniform float time;

void main() {
  if(color) {
    gl_FragColor = vec4(vec3(vPosition.x, vPosition.y, 0.3 * abs(sin(time * 3.14159 / 4.))), 1.0);
  } else {
    gl_FragColor = vec4(1.0);
  }
}
`,
};

export default spiroShader;
