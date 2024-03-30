import { useFrame, useThree } from '@react-three/fiber';
import { Leva, button, folder, levaStore, useControls } from 'leva';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NewWindow from 'react-new-window';
import * as THREE from 'three';
import { useRefState } from 'lib/hooks';
import { useIsMobile } from 'lib/mediaQueries';
import {
  type MidiConfig,
  initMidiController,
  useMidi,
  useMidiTwo,
} from 'lib/midi';
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

const VolumeControl = React.memo(function VolumeControl() {
  const volumeControls = useStore((s) => s.volumeControls);
  const { volumeControl, bassControl, trebleControl } = useControls(
    'audio',
    {
      volumeControl: { value: null, options: Object.keys(volumeControls) },
      bassControl: { value: null, options: Object.keys(volumeControls) },
      trebleControl: { value: null, options: Object.keys(volumeControls) },
    },
    [volumeControls],
  );

  useEffect(() => {
    if (volumeControl) {
      return useStore.subscribe(
        (state) => state.spectrum.volume,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        volumeControls[volumeControl]?.control,
      );
    }
    return undefined;
  }, [volumeControl, volumeControls]);

  useEffect(() => {
    if (bassControl) {
      return useStore.subscribe(
        (state) => state.spectrum.bass,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        volumeControls[bassControl]?.control,
      );
    }
    return undefined;
  }, [bassControl, volumeControls]);

  useEffect(() => {
    if (trebleControl) {
      return useStore.subscribe(
        (state) => state.spectrum.treble,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        volumeControls[trebleControl]?.control,
      );
    }
    return undefined;
  }, [trebleControl, volumeControls]);

  return null;
});

export const Controls = () => {
  const isMobile = useIsMobile();
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
    </>
  );
};

const raycaster = new THREE.Raycaster();
const Scene = ({ env }: { env: Env }) => {
  const gl = useThree((t) => t.gl);
  const camera = useThree((t) => t.camera);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const [volumeScaler, setVolumeScaler] = useRefState(1);
  const [volumeThreshold, setVolumeThreshold] = useRefState(1);
  const [exportScene, setExportScene] = useRefState(() => {
    // eslint-disable-next-line no-alert
    window.alert('Not instantiated yet');
  });
  useControls({
    audio: folder({
      scale: { value: 1, min: 0, max: 5, onChange: setVolumeScaler },
      threshold: { value: 0, min: 0, max: 127, onChange: setVolumeThreshold },
    }),
    Export: button(() => {
      exportScene.current();
    }),
  });
  const audio = useMicrophone(audioEnabled);

  const set = useStore((s) => s.set);

  useMidi({
    center: () => {
      // Reset camera position to original
      camera.far = INITIAL_CAMERA_STATE.far;
      camera.position.set(...INITIAL_CAMERA_STATE.position);
    },
  });

  useEffect(() => {
    const shiftPress = (e: KeyboardEvent) => {
      set({ shiftPressed: e.shiftKey });
    };
    document.addEventListener('keydown', shiftPress);
    document.addEventListener('keyup', shiftPress);

    return () => {
      document.removeEventListener('keydown', shiftPress);
      document.removeEventListener('keyup', shiftPress);
    };
  }, [set]);

  useFrame(({ camera, pointer }) => {
    if (useStore.getState().shiftPressed) {
      raycaster.setFromCamera(pointer, camera);
      set({ ray: raycaster.ray });
    }

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
      <env.Contents />
      <Effects name={env.name} CustomEffects={env.CustomEffects} />
    </>
  );
};

const GuiControls = ({ name }: { name: Config['name'] }) => {
  const set = useStore((state) => state.set);
  const audioEnabled = useStore((state) => state.audioEnabled);

  const [, setControl] = useControls(() => ({
    Contents: {
      value: name,
      options: Object.keys(scenes),
      onChange: (name: SceneName) => {
        if (name !== useStore.getState().env?.name)
          set({ env: { ...scenes[name] } });
      },
    },
    audio: folder({
      enabled: {
        value: audioEnabled,
        onChange: (audioEnabled: boolean) => {
          set({ audioEnabled });
        },
      },
      spectrum: folder(
        {
          volume: { value: 0, min: 0, max: 127 },
          bass: { value: 0, min: 0, max: 127 },
          midrange: { value: 0, min: 0, max: 127 },
          treble: { value: 0, min: 0, max: 127 },
        },
        {
          render: (get) => get('audio.enabled') as boolean,
        },
      ),
    }),
  }));

  useEffect(() => {
    return useStore.subscribe(
      spectrumSelector,
      ({ volume, bass, midrange, treble }: Spectrum) => {
        setControl({ volume, bass, midrange, treble });
      },
    );
  }, [setControl]);

  useMidiTwo(levaStore, 'audio.spectrum', {
    13: 'volume',
    14: 'bass',
    15: 'midrange',
    16: 'treble',
  });

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

  return audioEnabled ? <VolumeControl /> : null;
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
        // gl={
        // {
        // antialias: true,
        // Only turn this on when exporting
        // preserveDrawingBuffer: true,
        // }
        // }
        controls={env.name !== 'cubefield' && env.name !== 'control'}
      >
        <React.Suspense fallback={null}>
          <Scene env={env} />
        </React.Suspense>
        <GuiControls name={env.name} />
      </FiberScene>
    </>
  );
};

export default function MixerPage({ name }: { name: SceneName }) {
  const set = useStore((state) => state.set);

  // Initialize function. When moving to React 18 this may be a problem if it is run twice.
  useEffect(() => {
    let cleanup = noop;
    initMidiController()
      .then((cleanupMidi) => {
        cleanup = cleanupMidi;
      })
      .catch((e: unknown) => {
        throw e;
      });
    return cleanup;
  }, [set]);

  useEffect(() => {
    const { initialParams = {}, ...env } = scenes[name];
    set({ env, ...initialParams });
  }, [set, name]);

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
