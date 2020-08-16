export default {
  uniforms: {
    damp: { value: 0.96 },
    zoom: { value: 0.01 },
    tOld: { value: null },
    tNew: { value: null },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    '	vUv = uv;',
    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif
    uniform float damp;
    uniform float zoom;

    uniform sampler2D tOld;
    uniform sampler2D tNew;

    varying vec2 vUv;

    void main() {
    	vec4 texelNew = texture2D( tNew, vUv);

      vec2 coord = vUv;

      if(vUv.x > 0.5) {
        coord.x = coord.x-zoom;
      }
      if(vUv.x < 0.5) {
        coord.x = coord.x+zoom;
      }
      if(vUv.y > 0.5) {
        coord.y = coord.y-zoom;
      }
      if(vUv.y < 0.5) {
        coord.y = coord.y+zoom;
      }

    	vec4 texelOld = texture2D( tOld, coord ) * damp;
    	gl_FragColor = length(texelNew) > 0. ? texelNew : texelOld;
    }
  `,
};
