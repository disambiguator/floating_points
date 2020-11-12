import create from 'zustand';
import * as THREE from 'three';
import { Spectrum } from './audio';

export type State = {
  ray: THREE.Ray;
  spectrum: Spectrum;
};
const useStore = create<State>(() => ({
  ray: new THREE.Ray(),
  spectrum: {
    volume: 0,
    subBass: 0,
    bass: 0,
    midrange: 0,
    treble: 0,
    frequencyData: [],
  },
}));

export { useStore };
