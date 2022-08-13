import { useEffect } from 'react';
import { WebMidi } from 'webmidi';

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

// I guess I can bring this back one day
const MAPPINGS: Record<string, Record<number, number>> = {
  'Nocturn Keyboard': {},
  'Akai Pro AFX': {
    1: 1,
  },
};

export const useMidiController = (
  config: Record<string, (midiVal: number) => void>,
) => {
  useEffect(() => {
    WebMidi.enable().then(() => {
      Object.entries(MAPPINGS).forEach(([name, mapping]) => {
        const input = WebMidi.getInputByName(name);
        if (!input) return;

        input.addListener('controlchange', (e) => {
          const param = mapping[e.controller.number];
          if (param && config[param]) {
            // @ts-expect-error - have not handled when this is not a number
            config[param](e.value * 127);
          } else {
            // eslint-disable-next-line no-console
            console.log('Nothing registered for', e.controller.number, e.value);
          }
        });
      });
    });

    return () => {
      if (WebMidi.enabled) WebMidi.disable();
    };
  }, [config]);
};
