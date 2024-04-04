import { atom, getDefaultStore, useSetAtom } from 'jotai';
import { uniqueId } from 'lodash';
import { type ComponentType, ReactNode, useEffect } from 'react';
import * as THREE from 'three';
import { Spectrum } from './audio';

export type Config = {
  name: string;
  CustomEffects?: ComponentType;
  Contents: ComponentType;
  controls?: ReactNode;
};

export const store = getDefaultStore();

export const audioEnabledAtom = atom(false);
export const shiftPressedAtom = atom(false);

// Audio spectrum
export const volumeAtom = atom(0);
export const bassAtom = atom(0);
export const midrangeAtom = atom(0);
export const trebleAtom = atom(0);
export const frequencyDataAtom = atom<number[]>([]);
export const updateSpectrumAtom = atom(
  null,
  (_get, set, { volume, bass, midrange, treble, frequencyData }: Spectrum) => {
    set(volumeAtom, volume);
    set(bassAtom, bass);
    set(midrangeAtom, midrange);
    set(trebleAtom, treble);
    set(frequencyDataAtom, frequencyData);
  },
);
const baseVolumeControlsAtom = atom<
  Record<string, { id: string; control: (n: number) => void }>
>({});
export const volumeControlsAtom = atom((get) => get(baseVolumeControlsAtom));
const addVolumeControlAtom = atom(
  null,
  (get, set, newControls: Record<string, (n: number) => void>) => {
    const id = uniqueId();

    const newData = Object.fromEntries(
      Object.entries(newControls).map(([k, v]) => [k, { id, control: v }]),
    );

    const volumeControls = get(baseVolumeControlsAtom);
    set(baseVolumeControlsAtom, { ...volumeControls, ...newData });

    return () => {
      const volumeControls = get(baseVolumeControlsAtom);

      const newControls = Object.fromEntries(
        Object.entries(volumeControls).filter(([, value]) => {
          return value.id !== id;
        }),
      );

      set(baseVolumeControlsAtom, newControls);
    };
  },
);

export const raycaster = new THREE.Raycaster();
export const { ray } = raycaster;

export const useSpectrum = (values: Record<string, (n: number) => void>) => {
  const addVolumeControl = useSetAtom(addVolumeControlAtom);

  useEffect(() => addVolumeControl(values), [addVolumeControl, values]);
};
