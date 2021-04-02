import { useControls } from 'leva';
import { throttle } from 'lodash';
import { useEffect } from 'react';
import React from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import { ControlOptions, useControl } from 'react-three-gui';
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

export const useMidiControl = (
  name: string,
  options: Omit<ControlOptions, 'type' | 'min' | 'max'> = {},
) => useControl(name, { ...options, type: 'number', min: 0, max: 127 });

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

const GuiControls = <T,>({ name }: { name: Config<T>['name'] }) => {
  const color = useStore((state) => state.color);
  const zoomThreshold = useStore((state) => state.zoomThreshold);
  const noiseAmplitude = useStore((state) => state.noiseAmplitude);
  const trails = useStore((state) => state.trails);
  const set = useStore((state) => state.set);
  const angle = useStore((state) => state.angle);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const volumeScaler = useStore((state) => state.volumeScaler);
  const volumeControl = useStore((state) => state.volumeControl);
  const kaleidoscope = useStore((state) => state.kaleidoscope);

  useControl('Contents', {
    type: 'select',
    items: Object.keys(scenes()),
    state: [
      name,
      (name: sceneName) => {
        set({ env: { ...scenes()[name] } });
      },
    ],
  });

  useControl('color', {
    type: 'boolean',
    state: [color, (color) => set({ color })],
  });

  useMidiControl('Zoom', {
    state: [zoomThreshold, (z) => set({ zoomThreshold: z })],
  });

  useMidiControl('Amplitude', {
    state: [noiseAmplitude, (z) => set({ noiseAmplitude: z })],
  });

  useMidiControl('Trails', {
    state: [trails, (z) => set({ trails: z })],
  });

  useControl('Kaleidoscope', {
    type: 'number',
    state: [kaleidoscope, (z) => set({ kaleidoscope: z })],
    min: 0,
    max: 127,
  });

  useMidiControl('Angle', {
    state: [angle, (z) => set({ angle: z })],
  });

  useControl('Microphone Audio', {
    type: 'boolean',
    state: [audioEnabled, (audioEnabled) => set({ audioEnabled })],
  });

  useControl('Scale', {
    type: 'number',
    state: [volumeScaler, (volumeScaler) => set({ volumeScaler })],
    min: 0,
    max: 2,
  });

  useControl('Volume Control', {
    type: 'select',
    items: [
      'noiseAmplitude',
      'trails',
      'zoomThreshold',
      'kaleidoscope',
      'speed',
      'lineWidth',
    ],
    state: [volumeControl, (volumeControl) => set({ volumeControl })],
  });

  useControl('Export', {
    type: 'button',
    onClick: () => {
      useStore.getState().exportScene();
    },
  });

  return null;
};

const Mixer = () => {
  // const router = useRouter();
  const env = useStore((state) => state.env);

  // useEffect(() => {
  //   const routerParams = router.query.params as string;
  //   if (routerParams) {
  //     const parsedParams = JSON.parse(routerParams) as Config<T>['params'];

  //   }
  // }, [router.query.params]);

  // useEffect(() => {
  //   throttledHistory(params);
  // }, [params]);

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
        controls={env.name !== 'cubefield'}
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
