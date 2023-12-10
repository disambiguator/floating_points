import { DataInput, StoreType } from 'leva/dist/declarations/src/types';
import { noop } from 'lodash';
import { useEffect } from 'react';
import {
  type ControlChangeMessageEvent,
  type NoteMessageEvent,
  WebMidi,
} from 'webmidi';
import { useStore } from './store';

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
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    F1: 'button1',
    'F#1': 'button2',
    G1: 'button3',
    'G#1': 'button4',
    A1: 'button5',
    'A#1': 'button6',
    B1: 'button7',
    C2: 'button8',
    'G#0': 'shift',
    G0: 'shift',
    'B-1': 'function1',
    E1: 'center',
  },
  'Midi Fighter Twister': {
    // cc
    0: '1',
    1: '2',
    2: '3',
    3: '4',
    4: '5',
    5: '6',
    6: '7',
    7: '8',
    8: '9',
    9: '10',
    10: '11',
    11: '12',
    12: '13',
    13: '14',
    14: '15',
    15: '16',
    // notes
    'C-1': '1',
    'C#-1': '2',
    'D-1': '3',
    'D#-1': '4',
    'E-1': '5',
    'F-1': '6',
    'F#-1': '7',
    'G-1': '8',
    'G#-1': '9',
    'A-1': '10',
    'A#-1': '11',
    'B-1': '12',
    C0: '13',
    'C#0': '14',
    D0: '15',
    'D#0': '16',
  },
};

export const modifiers: Record<string, boolean> = {};

type Modifiers = typeof modifiers;

type ControlChangeCallback = (midiVal: number, modifiers: Modifiers) => void;
type NoteCallback = () => void;
export type MidiConfig = Partial<{
  1: ControlChangeCallback;
  2: ControlChangeCallback;
  3: ControlChangeCallback;
  4: ControlChangeCallback;
  5: ControlChangeCallback;
  6: ControlChangeCallback;
  7: ControlChangeCallback;
  8: ControlChangeCallback;
  button1: NoteCallback;
  button2: NoteCallback;
  button3: NoteCallback;
  function1: NoteCallback;
  center: NoteCallback;
}>;

export const initMidiController = async (): Promise<() => void> => {
  // This is optional based on browser support
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!navigator.requestMIDIAccess) {
    return noop;
  }

  await WebMidi.enable();

  const cleanupFunctions = WebMidi.inputs.map((input) => {
    const mapping = MAPPINGS[input.name];
    const noteOnListener = (e: NoteMessageEvent) => {
      const param = mapping[e.note.identifier];
      if (param) {
        modifiers[param] = true;
      }
    };
    input.addListener('noteon', noteOnListener);

    const noteOffListener = (e: NoteMessageEvent) => {
      const param = mapping[e.note.identifier];
      if (param) {
        modifiers[param] = false;
      }
    };
    input.addListener('noteoff', noteOffListener);

    // input.addListener('midimessage', (e) => {
    //   console.log(e.message);
    // });

    return () => {
      input.removeListener('noteon', noteOnListener);
      input.removeListener('noteoff', noteOffListener);
    };
  });

  // WebMidi.outputs.forEach((output) => {
  //   for (let i = 0; i < 16; i++) {
  //     output.channels[6].sendControlChange(i, 17);
  //   }
  // });

  return () => {
    cleanupFunctions.forEach((c) => {
      c();
    });
  };
};

export const useMidi = (config: MidiConfig) => {
  useEffect(() => {
    if (!WebMidi.enabled) {
      return;
    }

    const cleanup = WebMidi.inputs.map((input) => {
      const mapping = MAPPINGS[input.name];
      const controlChangeListener = (e: ControlChangeMessageEvent) => {
        const param = mapping[e.controller.number];
        if (param && param in config) {
          // @ts-expect-error - Fix this later.
          const callbackFn = config[param] as ControlChangeCallback;
          callbackFn(e.rawValue!, modifiers);
        }
      };
      input.addListener('controlchange', controlChangeListener);

      const noteOnListener = (e: NoteMessageEvent) => {
        const param = mapping[e.note.identifier];
        if (param && param in config) {
          // @ts-expect-error - Fix this later.
          const callbackFn = config[param] as NoteCallback;
          callbackFn();
        }
      };
      input.addListener('noteon', noteOnListener);

      return () => {
        input.removeListener('controlchange', controlChangeListener);
        input.removeListener('noteon', noteOnListener);
      };
    });

    return () => {
      cleanup.forEach((c) => {
        c();
      });
    };
  }, [config]);
};

export const useMidiTwo = (
  store: StoreType,
  folder: string,
  config: Record<string, string>,
) => {
  useEffect(() => {
    if (!WebMidi.enabled) {
      return;
    }

    const cleanup = WebMidi.inputs.map((input) => {
      const mapping = MAPPINGS[input.name];
      const controlChangeListener = (e: ControlChangeMessageEvent) => {
        const param = mapping[e.controller.number];
        if (param && param in config) {
          const storeParam = config[param];
          const fullPath = `${folder}.${storeParam}`;
          store.setValueAtPath(fullPath, e.rawValue, false);
        }
      };
      input.addListener('controlchange', controlChangeListener);

      const unsubscribe = new Map<string, () => void>();
      const noteOnListener = (e: NoteMessageEvent) => {
        const param = mapping[e.note.identifier];
        if (param && param in config) {
          if (!['13', '14', '15', '16'].includes(param)) {
            if (modifiers['13']) {
              const unsub = unsubscribe.get(param);
              if (unsub) {
                unsub();
                unsubscribe.delete(param);
              } else {
                unsubscribe.set(
                  param,
                  useStore.subscribe(
                    (state) => state.spectrum.volume,
                    (value) => {
                      const fullPath = `${folder}.${config[param]}`;
                      store.setValueAtPath(fullPath, value, false);
                    },
                  ),
                );
              }
            }
          }
        }
      };
      input.addListener('noteon', noteOnListener);

      return () => {
        input.removeListener('controlchange', controlChangeListener);
        input.removeListener('noteon', noteOnListener);
      };
    });

    return () => {
      cleanup.forEach((c) => {
        c();
      });
    };
  }, [store, folder, config]);

  useEffect(() => {
    if (!WebMidi.enabled) {
      return;
    }

    const unsubs = Object.entries(config).map(([param, storeParam]) => {
      const fullPath = `${folder}.${storeParam}`;

      const unsub = store.useStore.subscribe(
        (s) => {
          const item = s.data[fullPath] as DataInput | undefined;
          return item?.value as number | undefined;
        },
        (value) => {
          if (!value) return;

          WebMidi.outputs.forEach((output) => {
            const mapping = MAPPINGS[output.name];
            const number = Object.entries(mapping).find(
              ([, v]) => v === param,
            )?.[0];
            if (!number) return;
            output.channels[1].sendControlChange(Number(number), value);
          });
        },
      );
      return unsub;
    });

    return () => {
      unsubs.forEach((c) => {
        c();
      });
    };
  }, [store, folder, config]);
};
