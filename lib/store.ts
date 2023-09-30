import { uniqueId } from 'lodash';
import { type ComponentType, useEffect } from 'react';
import * as THREE from 'three';
import { type StoreApi, create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Spectrum } from './audio';

type SceneContents<T> = ComponentType<{
  config: T;
}>;

export type CustomEffectsType<T> = ComponentType<{
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
  set: StoreApi<State>['setState'];
  env: Env<any> | null;
  volumeControls: Record<string, { id: string; control: (n: number) => void }>;
  addVolumeControl: (
    newValue: Record<string, (n: number) => void>,
  ) => () => void;
};

export const spectrumSelector = (state: State) => state.spectrum;

export const useStore = create<State>()(
  subscribeWithSelector((set) => ({
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
    volumeControls: {},
    addVolumeControl: (newControls: Record<string, (n: number) => void>) => {
      const id = uniqueId();

      const newData = Object.fromEntries(
        Object.entries(newControls).map(([k, v]) => [k, { id, control: v }]),
      );

      set(({ volumeControls }: State) => ({
        volumeControls: { ...volumeControls, ...newData },
      }));

      return () => {
        set(({ volumeControls }: State) => {
          const newControls = Object.fromEntries(
            Object.entries(volumeControls).filter(([, value]) => {
              return value.id !== id;
            }),
          );

          return {
            volumeControls: newControls,
          };
        });
      };
    },
    env: null,
    set,
  })),
);

export const useSpectrum = (values: Record<string, (n: number) => void>) => {
  const addVolumeControl = useStore((state) => state.addVolumeControl);

  useEffect(() => addVolumeControl(values), [addVolumeControl, values]);
};
