import { useControls } from 'leva';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import create, { GetState, Mutate, SetState, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Spectrum } from './audio';

type SceneContents<T> = React.ComponentType<{
  config: T;
}>;

export type CustomEffectsType<T> = React.ComponentType<{
  params: T;
}>;

type Params = {
  audioEnabled: boolean;
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
  set: SetState<State>;
  env: Env<any> | null;
};

export const spectrumSelector = (state: State) => state.spectrum;

// TODO: Some weird typing issues popped up with recent Zustand changes. Try to get rid of some type casts later.
export const useStore = create<
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
      audioEnabled: false,
      env: null,
      set,
    }),
  ),
);

export const useSpectrum = (values: Record<string, (n: number) => void>) => {
  const audioEnabled = useStore((state) => state.audioEnabled);

  const { volume } = useControls('audio', {
    volume: { value: null, options: Object.keys(values) },
  });
  return useEffect(() => {
    if (audioEnabled && volume)
      return useStore.subscribe(
        (state) => state.spectrum.volume,
        values[volume],
      );
  }, [volume, values, audioEnabled]);
};
