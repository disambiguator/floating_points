export const KaleidoscopeShader = {
  uniforms: {
    // zoom: new THREE.Uniform(0.1),
    // damp: new THREE.Uniform(0.96),
    // tDiffuse: { value: null },
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
      vec2 newUv = vec2(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
      vec4 texelOld = texture2D(tDiffuse, newUv);

      gl_FragColor = texelOld;
    }
  `,
};
