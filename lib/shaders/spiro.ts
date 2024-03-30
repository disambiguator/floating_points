import * as THREE from 'three';
import fragmentShader from './spiro.frag';
import vertexShader from './spiro.vert';

export default function spiroShader() {
  return {
    uniforms: {
      amplitude: new THREE.Uniform(0.0),
      origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
      direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
      color: new THREE.Uniform(0.0),
      time: new THREE.Uniform(0),
    },
    vertexShader,
    fragmentShader,
  };
}
