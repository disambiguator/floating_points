import { atom, getDefaultStore } from 'jotai';
import { uniqueId } from 'lodash';
import { type ComponentType, useEffect } from 'react';
import * as THREE from 'three';
import { type StoreApi, create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Spectrum } from './audio';

export type Config = {
  name: string;
  CustomEffects?: ComponentType;
  Contents: ComponentType;
};

export type State = {
  spectrum: Spectrum;
  set: StoreApi<State>['setState'];
  volumeControls: Record<string, { id: string; control: (n: number) => void }>;
  addVolumeControl: (
    newValue: Record<string, (n: number) => void>,
  ) => () => void;
};

export const store = getDefaultStore();

export const audioEnabledAtom = atom(false);
export const shiftPressedAtom = atom(false);

export const raycaster = new THREE.Raycaster();
export const { ray } = raycaster;

export const spectrumSelector = (state: State) => state.spectrum;

export const useStore = create<State>()(
  subscribeWithSelector(
    (set): State => ({
      spectrum: {
        volume: 0,
        bass: 0,
        midrange: 0,
        treble: 0,
        frequencyData: [],
      },
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
      set,
    }),
  ),
);

export const useSpectrum = (values: Record<string, (n: number) => void>) => {
  const addVolumeControl = useStore((state) => state.addVolumeControl);

  useEffect(() => addVolumeControl(values), [addVolumeControl, values]);
};
