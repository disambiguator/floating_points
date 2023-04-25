import * as THREE from 'three';
import defaultForwardUV from './defaultForwardUV.vert';
import starkFrag from './stark.frag';

const StarkShader = () => ({
  vertexShader: defaultForwardUV,
  fragmentShader: starkFrag,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    s: { value: 0.04 },
    audio: {
      value: new THREE.DataTexture(new Uint8Array([0]), 0, 1, THREE.RedFormat),
    },
  },
});

export default StarkShader;
