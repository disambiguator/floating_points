import { useEffect } from 'react';
import * as THREE from 'three';
import create, { PartialState, SetState } from 'zustand';
import { Spectrum } from './audio';

export const useStateUpdate = (update: PartialState<State>) => {
  const set = useStore((state) => state.set);
  useEffect(() => {
    set(update);
  }, [set, update]);
};

export type State = {
  ray: THREE.Ray;
  spectrum: Spectrum;
  exportScene: () => void;
  setExportScene: (arg0: () => void) => void;
  color: boolean;
  set: SetState<State>;
  zoomThreshold: number;
  noiseAmplitude: number;
  trails: number;
  kaleidoscope: number;
  angle: number;
};
const useStore = create<State>((set) => ({
  ray: new THREE.Ray(),
  spectrum: {
    volume: 0,
    subBass: 0,
    bass: 0,
    midrange: 0,
    treble: 0,
    frequencyData: [],
  },
  exportScene: () => {
    window.alert('Not instantiated yet');
  },
  setExportScene: (exportScene: () => void) => {
    set({ exportScene });
  },
  color: false,
  zoomThreshold: 0,
  noiseAmplitude: 0,
  trails: 0,
  kaleidoscope: 0,
  angle: 64,
  set,
}));

export { useStore };
