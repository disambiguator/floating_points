import * as THREE from 'three';

export default {
  uniforms: {
    zoom: new THREE.Uniform(0.1),
    damp: new THREE.Uniform(0.96),
    tDiffuse: { value: null },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
    	vUv = uv;
    	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float zoom;
    uniform float damp;

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main() {
      vec4 texelOld = texture2D(tDiffuse, vUv);
    	vec4 shrunkTexel = texture2D(tDiffuse, vUv + (vUv - 0.5) * zoom);

    	gl_FragColor = max(texelOld, shrunkTexel);
    }
  `,
};
