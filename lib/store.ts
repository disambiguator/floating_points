import create from 'zustand';
import * as THREE from 'three';

const useStore = create(() => ({ ray: new THREE.Ray() }));

export { useStore };
