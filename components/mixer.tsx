import { useFrame, useThree } from '@react-three/fiber';
import { Leva, button, useControls } from 'leva';
import { OnChangeHandler } from 'leva/dist/declarations/src/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NewWindow from 'react-new-window';
import * as THREE from 'three';
import { PartialState } from 'zustand';
import { useIsMobile } from 'lib/mediaQueries';
import {
  Config,
  Env,
  MIDI_PARAMS,
  State,
  spectrumSelector,
  useStore,
} from 'lib/store';
import { Spectrum, analyseSpectrum, useMicrophone } from '../lib/audio';
import { Effects } from './effects';
import Page from './page';
import { FiberScene } from './scene';
import { sceneName, scenes } from './scenes';

const PopOutControls = ({ popOut }: { popOut: () => void }) => {
  useControls({
    'Pop Out': button(popOut),
  });

  return null;
};

const SpectrumVisualizer = () => {
  const [, set] = useControls(() => ({
    volume: { value: 0, min: 0, max: 127 },
    subBass: { value: 0, min: 0, max: 127 },
    bass: { value: 0, min: 0, max: 127 },
    midrange: { value: 0, min: 0, max: 127 },
    treble: { value: 0, min: 0, max: 127 },
  }));

  useEffect(() => {
    return useStore.subscribe(
      spectrumSelector,
      ({ volume, subBass, bass, midrange, treble }: Spectrum) => {
        set({ volume, subBass, bass, midrange, treble });
      },
    );
  }, [set]);

  return null;
};

export const Controls = () => {
  const isMobile = useIsMobile();
  const audioEnabled = useStore((state) => state.audioEnabled);
  const [poppedOut, setPoppedOut] = useState(false);
  const popOut = useCallback(() => {
    setPoppedOut(true);
  }, []);
  const popIn = useCallback(() => {
    setPoppedOut(false);
  }, []);

  return (
    <>
      {poppedOut ? (
        <NewWindow onUnload={popIn}>
          <Leva hideCopyButton fill flat titleBar={false} />
        </NewWindow>
      ) : (
        <>
          <Leva
            hideCopyButton
            collapsed={isMobile}
            fill={isMobile}
            titleBar={{ title: 'Controls', filter: false }}
          />
          {!isMobile && <PopOutControls popOut={popOut} />}
        </>
      )}
      {audioEnabled ? <SpectrumVisualizer /> : null}
    </>
  );
};

const Scene = <T,>({ env }: { env: Env<T> }) => {
  const gl = useThree((t) => t.gl);
  const setExportScene = useStore((state) => state.setExportScene);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const set = useStore((state) => state.set);
  const volumeControl = useStore((state) => state.volumeControl);

  const raycaster = new THREE.Raycaster();

  const audio = useMicrophone(audioEnabled);

  useFrame(({ camera, mouse }) => {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    useStore.setState({ ray: raycaster.ray });

    if (audio) {
      const { volumeScaler, volumeThreshold } = useStore.getState();
      const spectrum = analyseSpectrum(audio);
      const { volume } = spectrum;

      if (volumeControl) {
        //@ts-ignore
        set({
          [volumeControl]:
            volume * volumeScaler > volumeThreshold ? volume * volumeScaler : 0,
        });
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

const onUserChange =
  (onChange: OnChangeHandler): OnChangeHandler =>
  (value, path, context) => {
    if (!context.initial) onChange(value, path, context);
  };

const GuiControls = <T,>({ name }: { name: Config<T>['name'] }) => {
  const {
    color,
    audioEnabled,
    volumeScaler,
    volumeControl,
    volumeThreshold,
    set,
    ...rest
  } = useMemo(() => useStore.getState(), []);

  useControls({
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
    volumeThreshold: {
      value: volumeThreshold,
      min: 0,
      max: 127,
      onChange: onUserChange((newValue) => set({ volumeThreshold: newValue })),
    },
    Export: button(() => {
      useStore.getState().exportScene();
    }),
  });

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
        linear
        flat
        gl={{
          antialias: true,
          // Only turn this on when exporting
          // preserveDrawingBuffer: true,
        }}
        controls={env.name !== 'cubefield' && env.name !== 'control'}
      >
        <Scene env={env} />
        <GuiControls name={env.name} />
      </FiberScene>
    </>
  );
};

export default function MixerPage({ name }: { name: sceneName }) {
  const set = useStore((state) => state.set);
  const { initialParams = {}, ...env } = useMemo(() => scenes[name], [name]);
  useEffect(() => {
    const update = { env, ...initialParams } as PartialState<State>;
    set(update);
  }, [set, initialParams, env]);

  return (
    <Page>
      <video
        id="webcam"
        style={{ display: 'none' }}
        autoPlay
        playsInline
      ></video>
      <Mixer />
    </Page>
  );
}
