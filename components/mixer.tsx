import { useFrame, useThree } from '@react-three/fiber';
import { Leva, button, folder, useControls } from 'leva';
import type { OnChangeHandler } from 'leva/dist/declarations/src/types';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NewWindow from 'react-new-window';
import * as THREE from 'three';
import { useRefState } from 'lib/hooks';
import { useIsMobile } from 'lib/mediaQueries';
import { type MidiConfig, initMidiController, useMidi } from 'lib/midi';
import { type Config, type Env, spectrumSelector, useStore } from 'lib/store';
import { INITIAL_CAMERA_STATE } from './config';
import { Effects } from './effects';
import Page from './page';
import { FiberScene } from './scene';
import { type SceneName, sceneNames, scenes } from './scenes';
import { type Spectrum, analyseSpectrum, useMicrophone } from '../lib/audio';

// In its own component because there is no way to conditionally show controls in Leva
const PopOutControls = ({ popOut }: { popOut: () => void }) => {
  useControls({
    'Pop Out': button(popOut),
  });

  return null;
};

const SpectrumVisualizer = () => {
  const [, set] = useControls(() => ({
    audio: folder({
      spectrum: folder({
        volume: { value: 0, min: 0, max: 127 },
        subBass: { value: 0, min: 0, max: 127 },
        bass: { value: 0, min: 0, max: 127 },
        midrange: { value: 0, min: 0, max: 127 },
        treble: { value: 0, min: 0, max: 127 },
      }),
    }),
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

const raycaster = new THREE.Raycaster();
const Scene = <T,>({ env }: { env: Env<T> }) => {
  const gl = useThree((t) => t.gl);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const [volumeScaler, setVolumeScaler] = useRefState(1);
  const [volumeThreshold, setVolumeThreshold] = useRefState(1);
  const [exportScene, setExportScene] = useRefState(() => {
    // eslint-disable-next-line no-alert
    window.alert('Not instantiated yet');
  });
  useControls({
    audio: folder({
      scale: { value: 1, min: 0, max: 10, onChange: setVolumeScaler },
      threshold: { value: 0, min: 0, max: 127, onChange: setVolumeThreshold },
    }),
    Export: button(() => {
      exportScene.current();
    }),
  });
  const audio = useMicrophone(audioEnabled);

  useFrame(({ camera, mouse }) => {
    raycaster.setFromCamera(mouse, camera);
    useStore.setState({ ray: raycaster.ray });

    if (audio) {
      useStore.setState({
        spectrum: analyseSpectrum(
          audio,
          volumeThreshold.current,
          volumeScaler.current,
        ),
      });
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
  const { audioEnabled, set } = useMemo(() => useStore.getState(), []);

  const [, setControl] = useControls(() => ({
    Contents: {
      value: name,
      options: Object.keys(scenes),
      onChange: onUserChange((name: SceneName) => {
        if (name !== useStore.getState().env?.name)
          set({ env: { ...scenes[name] } });
      }),
    },
    audio: folder({
      enabled: {
        value: audioEnabled,
        onChange: onUserChange((audioEnabled: boolean) => {
          set({ audioEnabled });
        }),
      },
    }),
  }));

  useMidi(
    useMemo(
      (): MidiConfig => ({
        button1: () => {
          setControl({ Contents: sceneNames[0] });
        },
        button2: () => {
          setControl({ Contents: sceneNames[1] });
        },
        button3: () => {
          setControl({ Contents: sceneNames[2] });
        },
      }),
      [setControl],
    ),
  );

  return null;
};

const Mixer = () => {
  const env = useStore((state) => state.env);
  if (!env) return null;

  return (
    <>
      <Controls />
      <FiberScene
        camera={INITIAL_CAMERA_STATE}
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

export default function MixerPage({ name }: { name: SceneName }) {
  const set = useStore((state) => state.set);
  const scene = useMemo(() => scenes[name], [name]);

  // Initialize function. When moving to React 18 this may be a problem if it is run twice.
  useEffect(() => {
    let cleanup = noop;
    initMidiController()
      .then((cleanupMidi) => {
        cleanup = cleanupMidi;
        const { initialParams = {}, ...env } = scene;
        set({ env, ...initialParams });
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
    return cleanup;
  }, [set, scene]);

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
