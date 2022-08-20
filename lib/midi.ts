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

const MAPPINGS: Record<
  string,
  Record<string, string | [string, { enabled: number }]>
> = {
  'Nocturn Keyboard': {},
  'Akai Pro AFX': {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    F1: 'button1',
    'F#1': 'button2',
    G1: 'button3',
    'G#1': 'button4',
    A1: 'button5',
    'A#1': 'button6',
    B1: 'button7',
    C2: 'button8',
    'G#0': 'rightshift',
    G0: 'leftshift',
    'B-1': ['function1', { enabled: 0.3 }],
    // controller 20 is led number display
    // controller 30 is weird led strip
  },
};

const modifiers = {
  shift: false,
};

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
  button1: NoteCallback;
  button2: NoteCallback;
  button3: NoteCallback;
  function1: NoteCallback;
}>;

// const sweep = (f: (attack: number) => void) => {
//   let v = 0;

//   const intervalId = setInterval(() => {
//     if (v >= 1) {
//       clearInterval(intervalId);
//       f(0);
//       return;
//     }

//     f(v);
//     v = v + 0.01;
//   }, 100);
// };

export const initMidiController = async (): Promise<() => void> => {
  await WebMidi.enable();

  const cleanupFunctions = Object.entries(MAPPINGS).map(([name, mapping]) => {
    const input = WebMidi.getInputByName(name);
    if (!input) return noop;

    WebMidi.getOutputByName(name).sendAllSoundOff();

    const noteOnListener = (e: NoteMessageEvent) => {
      const param = mapping[e.note.identifier];
      if (param === 'leftshift') {
        modifiers.shift = true;
      }
      if (param === 'rightshift') {
        modifiers.shift = true;
      }
    };
    input.addListener('noteon', noteOnListener);

    const noteOffListener = (e: NoteMessageEvent) => {
      const param = mapping[e.note.identifier];
      if (param === 'leftshift') {
        modifiers.shift = false;
      }
      if (param === 'rightshift') {
        modifiers.shift = false;
      }
    };
    input.addListener('noteoff', noteOffListener);

    return () => {
      input.removeListener('noteon', noteOnListener);
      input.removeListener('noteoff', noteOffListener);
    };
  });

  return () => cleanupFunctions.forEach((c) => c());
};

export const useMidi = (config: MidiConfig) => {
  useEffect(() => {
    if (!WebMidi.enabled) {
      throw 'WebMidi is not enabled. Run `useMidiController`';
    }

    const cleanup = Object.entries(MAPPINGS).map(([name, mapping]) => {
      const input = WebMidi.getInputByName(name);
      const output = WebMidi.getOutputByName(name);
      if (!input) return noop;

      const entries = Object.entries(mapping);
      Object.keys(config).forEach((button) => {
        const [note] = entries.find(([, noteConfig]) => {
          if (Array.isArray(noteConfig)) {
            return noteConfig[0] === button;
          }
          return noteConfig === button;
        });
        output.playNote(note, { attack: 0.1 });
      });

      const controlChangeListener = (e: ControlChangeMessageEvent) => {
        // Debugging
        // console.log(e);

        const param = mapping[e.controller.number];
        if (!param) {
          return;
        }

        const identifier = Array.isArray(param) ? param[0] : param;
        if (!(identifier in config)) {
          return;
        }

        if (e.rawValue) {
          // @ts-expect-error - Fix this later.
          const callbackFn: ControlChangeCallback = config[identifier];
          callbackFn(e.rawValue, modifiers);
        } else {
          // eslint-disable-next-line no-console
          console.error('This should not happen', e);
        }
      };
      input.addListener('controlchange', controlChangeListener);

      const noteOnListener = (e: NoteMessageEvent) => {
        const param = mapping[e.note.identifier];
        if (param && param in config) {
          // @ts-expect-error - Fix this later.
          const callbackFn: NoteCallback = config[param];
          callbackFn();
          output.playNote(e.note.identifier, { attack: Math.random() });
        }
        // Debugging
        console.log(e.note.identifier);
      };
      input.addListener('noteon', noteOnListener);

      const noteOffListener = (e: NoteMessageEvent) => {
        const param = mapping[e.note.identifier];
        if (param && param in config) {
          output.playNote(e.note.identifier, { attack: 0 });
        }
      };
      input.addListener('noteoff', noteOffListener);

      return () => {
        input.removeListener('controlchange', controlChangeListener);
        input.removeListener('noteon', noteOnListener);
        input.removeListener('noteoff', noteOffListener);
      };
    });

    return () => cleanup.forEach((c) => c());
  }, [config]);
};
