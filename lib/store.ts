import React from 'react';
import * as THREE from 'three';
import create, { GetState, Mutate, SetState, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Spectrum } from './audio';

export const MIDI_PARAMS = [
  'noiseAmplitude',
  'trails',
  'zoomThreshold',
  'bitcrush',
  'angle',
  'kaleidoscope',
] as const;

export type MidiParam = typeof MIDI_PARAMS[number];

type SceneContents<T> = React.ComponentType<{
  config: T;
}>;

export type CustomEffectsType<T> = React.ComponentType<{
  params: T;
}>;

type Params = { [key in MidiParam]: number } & {
  color: boolean;
  audioEnabled: boolean;
  volumeScaler: number;
  volumeThreshold: number;
  volumeControl: MidiParam | null;
};

export type Config<T = Record<string, any>> = {
  name: string;
  params: T;
  initialParams?: Partial<Params>;
  CustomEffects?: CustomEffectsType<T>;
  Contents: SceneContents<T>;
};

export type Env<T> = Omit<Config<T>, 'initialParams'>;

export type State = Params & {
  ray: THREE.Ray;
  spectrum: Spectrum;
  exportScene: () => void;
  setExportScene: (arg0: () => void) => void;
  set: SetState<State>;
  env: Env<any> | null;
};

export const trailsSelector = (state: State) => state.trails;
export const kaleidoscopeSelector = (state: State) => state.kaleidoscope;
export const bitcrushSelector = (state: State) => state.bitcrush;
export const angleSelector = (state: State) => state.angle;
export const spectrumSelector = (state: State) => state.spectrum;

// TODO: Some weird typing issues popped up with recent Zustand changes. Try to get rid of some type casts later.
const useStore = create<
  State,
  SetState<State>,
  GetState<State>,
  Mutate<StoreApi<State>, [['zustand/subscribeWithSelector', never]]>
>(
  subscribeWithSelector(
    (set): State => ({
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
        // eslint-disable-next-line no-alert
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
      volumeThreshold: 0,
      volumeControl: null,
      env: null,
      set,
    }),
  ),
);

export { useStore };
