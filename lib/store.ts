import create from 'zustand';
import * as THREE from 'three';

const [useStore, api] = create(() => ({
  ray: new THREE.Ray(),
}));

export { useStore, api };
