import { useFrame, useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { OnChangeHandler } from 'leva/dist/declarations/src/types';
import { throttle } from 'lodash';
import { useEffect, useMemo } from 'react';
import React from 'react';
import * as THREE from 'three';
import WebMidi from 'webmidi';
import { Spectrum, analyseSpectrum, useMicrophone } from '../lib/audio';
import { Config, MidiParam, useStore } from '../lib/store';
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

const Scene = <T,>({ env }: { env: Config<T> }) => {
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
  const {
    color,
    angle,
    zoomThreshold,
    noiseAmplitude,
    trails,
    kaleidoscope,
    audioEnabled,
    volumeScaler,
    volumeControl,
    bitcrush,
    set,
  } = useMemo(() => useStore.getState(), []);

  useControls(() => ({
    Contents: {
      value: name,
      options: Object.keys(scenes()),
      onChange: onUserChange((name: sceneName) => {
        if (name !== useStore.getState().env?.name)
          set({ env: { ...scenes()[name] } });
      }),
    },
    Color: {
      value: color,
      onChange: onUserChange((color) => set({ color })),
    },
    Zoom: {
      value: zoomThreshold,
      min: 0,
      max: 127,
      onChange: onUserChange((zoomThreshold) => set({ zoomThreshold })),
    },
    Amplitude: {
      value: noiseAmplitude,
      min: 0,
      max: 127,
      onChange: onUserChange((noiseAmplitude) => set({ noiseAmplitude })),
    },
    Trails: {
      value: trails,
      min: 0,
      max: 127,
      onChange: onUserChange((trails) => set({ trails })),
    },
    Kaleidoscope: {
      value: kaleidoscope,
      min: 0,
      max: 127,
      onChange: onUserChange((kaleidoscope) => set({ kaleidoscope })),
    },
    Bitcrush: {
      value: bitcrush,
      min: 0,
      max: 127,
      onChange: onUserChange((bitcrush) => set({ bitcrush })),
    },
    Angle: {
      value: angle,
      min: 0,
      max: 127,
      onChange: onUserChange((angle) => set({ angle })),
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
      options: [
        'noiseAmplitude',
        'trails',
        'zoomThreshold',
        'kaleidoscope',
        'speed',
        'lineWidth',
      ],
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

export default function MixerPage() {
  return (
    <Page>
      <Mixer />
    </Page>
  );
}
