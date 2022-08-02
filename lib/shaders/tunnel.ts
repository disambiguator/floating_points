import * as THREE from 'three';
import tunnelFragment from './tunnel.frag';

const TunnelShader = {
  uniforms: {
    damp: { value: 0.96 },
    xspeed: { value: 0.01 },
    yspeed: { value: 0.01 },
    trailNoiseAmplitude: { value: 0 },
    trailNoiseFrequency: { value: 0 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    angle: { value: 0 },
    mouse: { value: new THREE.Vector2(0, 0) },
    aspect: { value: 0 },
    numSides: { value: 0 },
    bitcrush: { value: 0 },
    zoomDamp: { value: 0.96 },
    zoom: { value: 0.01 },
    resolution: { value: new THREE.Vector2(0, 0) },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    '	vUv = uv;',
    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: tunnelFragment,
};

export default TunnelShader;
