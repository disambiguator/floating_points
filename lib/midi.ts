import { noop } from 'lodash';
import { useEffect } from 'react';
import {
  type ControlChangeMessageEvent,
  type NoteMessageEvent,
  WebMidi,
} from 'webmidi';

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

const MAPPINGS: Record<string, Record<string, string>> = {
  'Nocturn Keyboard': {},
  'Akai Pro AFX': {
    1: '1',
    F1: 'button1',
    'F#1': 'button2',
  },
};

type ControlChangeCallback = (midiVal: number) => void;
type NoteCallback = () => void;
type Config = {
  1?: ControlChangeCallback;
  button1?: NoteCallback;
  button2?: NoteCallback;
};

export const useMidiController = (config: Config) => {
  useEffect(() => {
    let cleanup: (() => void)[] = [];

    WebMidi.enable().then(() => {
      cleanup = Object.entries(MAPPINGS).map(([name, mapping]) => {
        const input = WebMidi.getInputByName(name);
        if (!input) return noop;

        const controlChangeListener = (e: ControlChangeMessageEvent) => {
          const param = mapping[e.controller.number];

          if (param && param in config) {
            if (typeof e.value === 'number') {
              // @ts-expect-error - Fix this later.
              const callbackFn: ControlChangeCallback = config[param];
              callbackFn(e.value * 127);
            } else {
              // eslint-disable-next-line no-console
              console.error('This should not happen', e);
            }
          }
        };
        input.addListener('controlchange', controlChangeListener);

        const noteOnListener = (e: NoteMessageEvent) => {
          const param = mapping[e.note.identifier];
          if (param && param in config) {
            // @ts-expect-error - Fix this later.
            const callbackFn: NoteCallback = config[param];
            callbackFn();
          }
          // Debugging
          // console.log(e.note.identifier);
        };
        input.addListener('noteon', noteOnListener);

        // Cleanup function
        return () => {
          input.removeListener('controlchange', controlChangeListener);
          input.removeListener('noteon', noteOnListener);
        };
      });
    });

    return () => cleanup.forEach((c) => c());
  }, [config]);
};
