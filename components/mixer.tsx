import { useFrame, useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { OnChangeHandler } from 'leva/dist/declarations/src/types';
import { throttle } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import WebMidi from 'webmidi';
import { PartialState } from 'zustand';
import {
  Config,
  Env,
  MIDI_PARAMS,
  MidiParam,
  State,
  useStore,
} from 'lib/store';
import { Spectrum, analyseSpectrum, useMicrophone } from '../lib/audio';
import { Effects } from './effects';
import Page from './page';
import { FiberScene } from './scene';
import { sceneName, scenes } from './scenes';

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

export const Controls = () => {
  const set = useStore((state) => state.set);
  const audioEnabled = useStore((state) => state.audioEnabled);

  useEffect(() => {
    WebMidi.enable(() => {
      WebMidi.inputs.forEach((input) => {
        const mapping = MAPPINGS[input.name];
        if (!mapping) return;

        input.addListener('controlchange', 'all', (e) => {
          const param = mapping[e.controller.number];
          if (param) {
            // @ts-ignore
            set({ [param]: e.value });
          } else {
            console.log(e);
          }
        });
      });
    });

    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener();
      });
      if (WebMidi.enabled) WebMidi.disable();
    };
  }, [set]);

  return audioEnabled ? <ControlPanel /> : null;
};

const ControlPanel = () => {
  const [_values, set] = useControls(() => ({
    volume: { value: 0, min: 0, max: 127 },
    subBass: { value: 0, min: 0, max: 127 },
    bass: { value: 0, min: 0, max: 127 },
    midrange: { value: 0, min: 0, max: 127 },
    treble: { value: 0, min: 0, max: 127 },
  }));

  useEffect(() => {
    return useStore.subscribe(
      ({ volume, subBass, bass, midrange, treble }: Spectrum) => {
        set({ volume, subBass, bass, midrange, treble });
      },
      (state) => state.spectrum,
    );
  }, [set]);

  return null;
};

const Scene = <T,>({ env }: { env: Env<T> }) => {
  const { camera, mouse, gl } = useThree();
  const setExportScene = useStore((state) => state.setExportScene);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const set = useStore((state) => state.set);
  const volumeScaler = useStore((state) => state.volumeScaler);
  const volumeControl = useStore((state) => state.volumeControl);

  const raycaster = new THREE.Raycaster();

  const audio = useMicrophone(audioEnabled);

  useFrame(() => {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    useStore.setState({ ray: raycaster.ray });

    if (audio) {
      const spectrum = analyseSpectrum(audio);
      const { volume } = spectrum;

      if (volumeControl) {
        //@ts-ignore
        set({ [volumeControl]: volume * volumeScaler });
      }

      useStore.setState({ spectrum });
    }
  });
  useEffect(() => {
    setExportScene(() => {
      const href = gl.domElement.toDataURL();
      const link = document.createElement('a');
      link.href = href;
      link.download = 'disambiguous_export.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [gl.domElement, setExportScene]);

  return (
    <>
      <env.Contents config={env.params} />
      <Effects
        name={env.name}
        params={env.params}
        CustomEffects={env.CustomEffects}
      />
    </>
  );
};

const _throttledHistory = throttle((params) => {
  const url = `/mixer?params=${JSON.stringify(params)}`;
  window.history.pushState('', '', url);
}, 1000);

const onUserChange =
  (onChange: OnChangeHandler): OnChangeHandler =>
  (value, path, context) => {
    if (!context.initial) onChange(value, path, context);
  };

const GuiControls = <T,>({ name }: { name: Config<T>['name'] }) => {
  const { color, audioEnabled, volumeScaler, volumeControl, set, ...rest } =
    useMemo(() => useStore.getState(), []);

  useControls(() => ({
    ...Object.fromEntries(
      MIDI_PARAMS.map((v) => [
        v,
        {
          value: rest[v],
          min: 0,
          max: 127,
          // @ts-ignore
          onChange: onUserChange((newValue) => set({ [v]: newValue })),
        },
      ]),
    ),
    Contents: {
      value: name,
      options: Object.keys(scenes),
      onChange: onUserChange((name: sceneName) => {
        if (name !== useStore.getState().env?.name)
          set({ env: { ...scenes[name] } });
      }),
    },
    Color: {
      value: color,
      onChange: onUserChange((color) => set({ color })),
    },
    'Microphone Audio': {
      value: audioEnabled,
      onChange: onUserChange((audioEnabled) => set({ audioEnabled })),
    },
    Scale: {
      value: volumeScaler,
      min: 0,
      max: 2,
      onChange: onUserChange((volumeScaler) => set({ volumeScaler })),
    },
    'Volume Control': {
      value: volumeControl,
      options: [...MIDI_PARAMS, 'speed', 'lineWidth'],
      onChange: onUserChange((volumeControl) => set({ volumeControl })),
    },
    Export: button(() => {
      useStore.getState().exportScene();
    }),
  }));

  return null;
};

const Mixer = () => {
  const env = useStore((state) => state.env);
  if (!env) return null;

  return (
    <>
      <Controls />
      <FiberScene
        camera={{ far: 10000, position: [0, 0, 300] }}
        gl={{
          antialias: true,
          // Only turn this on when exporting
          // preserveDrawingBuffer: true,
        }}
        controls={env.name !== 'cubefield' && env.name !== 'control'}
        gui
      >
        <Scene env={env} />
        <GuiControls name={env.name} />
      </FiberScene>
    </>
  );
};

export default function MixerPage({ name }: { name: sceneName }) {
  const set = useStore((state) => state.set);
  const { initialParams, ...env } = useMemo(() => scenes[name], [name]);
  useEffect(() => {
    const update = { env, ...initialParams } as PartialState<State>;
    set(update);
  }, [set, initialParams, env]);

  return (
    <Page>
      <Mixer />
    </Page>
  );
}
