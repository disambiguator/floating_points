import { useEffect } from 'react';
import * as THREE from 'three';
import create, { SetState } from 'zustand';
import { Spectrum } from './audio';

export type MidiParam =
  | 'noiseAmplitude'
  | 'trails'
  | 'zoomThreshold'
  | 'kaleidoscope';

export const useStateUpdate: SetState<State> = (update) => {
  const set = useStore((state) => state.set);
  useEffect(() => {
    set(update);
  }, [set, update]);
};

export type CustomControls = React.ReactNode;

export type SceneContents<T> = React.ComponentType<{
  config: T;
}>;

export type CustomEffectsType<T> = React.ComponentType<{
  params: T;
}>;

export type Config<T> = {
  name: string;
  params: T;
  CustomEffects?: CustomEffectsType<T>;
  Contents: SceneContents<T>;
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
  bitcrush: number;
  angle: number;
  audioEnabled: boolean;
  volumeScaler: number;
  volumeControl: MidiParam | null;
  env: Config<any> | null;
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
  bitcrush: 0,
  audioEnabled: false,
  volumeScaler: 1,
  volumeControl: null,
  env: null,
  set,
}));

export { useStore };
