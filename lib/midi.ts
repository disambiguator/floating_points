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
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    F1: 'button1',
    'F#1': 'button2',
    'G#0': 'shift',
  },
};

type Modifiers = { shift: boolean };

type ControlChangeCallback = (midiVal: number, modifiers: Modifiers) => void;
type NoteCallback = () => void;
export type MidiConfig = Partial<{
  1: ControlChangeCallback;
  2: ControlChangeCallback;
  3: ControlChangeCallback;
  4: ControlChangeCallback;
  5: ControlChangeCallback;
  6: ControlChangeCallback;
  button1: NoteCallback;
  button2: NoteCallback;
}>;

const modifiers: Modifiers = {
  shift: false,
};

export const initMidiController = async (): Promise<() => void> => {
  if (WebMidi.enabled) {
    throw 'useMidiController was already run.';
  }

  await WebMidi.enable();

  const cleanupFunctions = Object.entries(MAPPINGS).map(([name, mapping]) => {
    const input = WebMidi.getInputByName(name);
    if (!input) return noop;

    const noteOnListener = (e: NoteMessageEvent) => {
      const param = mapping[e.note.identifier];
      if (param === 'shift') {
        modifiers.shift = true;
      }
    };
    input.addListener('noteon', noteOnListener);

    const noteOffListener = (e: NoteMessageEvent) => {
      const param = mapping[e.note.identifier];
      if (param === 'shift') {
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
      if (!input) return noop;

      const controlChangeListener = (e: ControlChangeMessageEvent) => {
        const param = mapping[e.controller.number];

        if (param && param in config) {
          if (typeof e.rawValue === 'number') {
            // @ts-expect-error - Fix this later.
            const callbackFn: ControlChangeCallback = config[param];
            callbackFn(e.rawValue, modifiers);
          } else {
            // eslint-disable-next-line no-console
            console.error('This should not happen', e);
          }
        }
        // Debugging
        // console.log(e);
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

      return () => {
        input.removeListener('controlchange', controlChangeListener);
        input.removeListener('noteon', noteOnListener);
      };
    });

    return () => cleanup.forEach((c) => c());
  }, [config]);
};
