import { useEffect } from 'react';
import webmidi from 'webmidi';
import { MidiParam, useStore } from './store';

export const scaleMidi = (
  midi: number,
  min: number,
  max: number,
  deadzone = false,
) => {
  if (deadzone && [63, 64].includes(midi)) {
    return min + (63.5 * (max - min)) / 127;
  }
  return min + (midi * (max - min)) / 127;
};

const MAPPINGS: Record<string, Record<number, MidiParam>> = {
  'Nocturn Keyboard': {
    7: 'noiseAmplitude',
    10: 'trails',
    74: 'zoomThreshold',
    71: 'kaleidoscope',
  },
  'Akai Pro AFX': {
    1: 'noiseAmplitude',
    2: 'trails',
    3: 'zoomThreshold',
    4: 'kaleidoscope',
  },
};

export const useMidiController = () => {
  const set = useStore((state) => state.set);

  useEffect(() => {
    webmidi.enable(() => {
      webmidi.inputs.forEach((input) => {
        const mapping = MAPPINGS[input.name];
        if (!mapping) return;

        input.addListener('controlchange', 'all', (e) => {
          const param = mapping[e.controller.number];
          if (param) {
            // @ts-ignore
            set({ [param]: e.value });
          } else {
            // eslint-disable-next-line no-console
            console.log(e);
          }
        });
      });
    });

    return () => {
      webmidi.inputs.forEach((input) => {
        input.removeListener();
      });
      if (webmidi.enabled) webmidi.disable();
    };
  }, [set]);
};
