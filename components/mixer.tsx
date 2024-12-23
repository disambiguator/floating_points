import { useFrame, useThree } from '@react-three/fiber';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Leva, button, folder, levaStore, useControls } from 'leva';
import { noop } from 'lodash';
import React from 'react';
import NewWindow from 'react-new-window';
import { useRefState } from 'lib/hooks';
import { useIsMobile } from 'lib/mediaQueries';
import {
  type MidiConfig,
  initMidiController,
  useMidi,
  useMidiTwo,
} from 'lib/midi';
import {
  type Config,
  audioEnabledAtom,
  bassAtom,
  midrangeAtom,
  raycaster,
  shiftPressedAtom,
  store,
  trebleAtom,
  updateSpectrumAtom,
  volumeAtom,
  volumeControlsAtom,
} from 'lib/store';
import { INITIAL_CAMERA_STATE } from './config';
import { Effects } from './effects';
import Page from './page';
import { FiberScene } from './scene';
import { type SceneName, sceneNames, scenes } from './scenes';
import { analyseSpectrum, useMicrophone } from '../lib/audio';

const maybeConfigAtom = atom<(typeof scenes)[keyof typeof scenes] | null>(null);
const configAtom = atom((get) => get(maybeConfigAtom)!);
const setConfigAtom = atom(
  null,
  (_get, set, config: (typeof scenes)[keyof typeof scenes]) => {
    set(maybeConfigAtom, config);
  },
);

// In its own component because there is no way to conditionally show controls in Leva
const PopOutControls = ({ popOut }: { popOut: () => void }) => {
  useControls({
    'Pop Out': button(popOut),
  });

  return null;
};

const VolumeControl = React.memo(function VolumeControl() {
  const volumeControls = useAtomValue(volumeControlsAtom);
  const { volumeControl, bassControl, trebleControl } = useControls(
    'audio',
    {
      volumeControl: { value: null, options: Object.keys(volumeControls) },
      bassControl: { value: null, options: Object.keys(volumeControls) },
      trebleControl: { value: null, options: Object.keys(volumeControls) },
    },
    [volumeControls],
  );

  React.useEffect(() => {
    if (volumeControl) {
      return store.sub(volumeAtom, () => {
        volumeControls[volumeControl].control(store.get(volumeAtom));
      });
    }
    return undefined;
  }, [volumeControl, volumeControls]);

  React.useEffect(() => {
    if (bassControl) {
      return store.sub(bassAtom, () => {
        volumeControls[bassControl].control(store.get(bassAtom));
      });
    }
    return undefined;
  }, [bassControl, volumeControls]);

  React.useEffect(() => {
    if (trebleControl) {
      return store.sub(trebleAtom, () => {
        volumeControls[trebleControl].control(store.get(trebleAtom));
      });
    }
    return undefined;
  }, [trebleControl, volumeControls]);

  return null;
});

export const Controls = () => {
  const isMobile = useIsMobile();
  const [poppedOut, setPoppedOut] = React.useState(false);
  const popOut = React.useCallback(() => {
    setPoppedOut(true);
  }, []);
  const popIn = React.useCallback(() => {
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

const Scene = ({ config }: { config: Config }) => {
  const gl = useThree((t) => t.gl);
  const camera = useThree((t) => t.camera);
  const [exportScene, setExportScene] = useRefState(() => {
    // eslint-disable-next-line no-alert
    window.alert('Not instantiated yet');
  });
  useControls({
    Export: button(() => {
      exportScene.current();
    }),
  });

  const setShiftPressed = useSetAtom(shiftPressedAtom);

  useMidi({
    center: () => {
      // Reset camera position to original
      camera.far = INITIAL_CAMERA_STATE.far;
      camera.position.set(...INITIAL_CAMERA_STATE.position);
    },
  });

  React.useEffect(() => {
    const shiftPress = (e: KeyboardEvent) => {
      setShiftPressed(e.shiftKey);
    };
    document.addEventListener('keydown', shiftPress);
    document.addEventListener('keyup', shiftPress);

    return () => {
      document.removeEventListener('keydown', shiftPress);
      document.removeEventListener('keyup', shiftPress);
    };
  }, [setShiftPressed]);

  useFrame(({ camera, pointer }) => {
    if (store.get(shiftPressedAtom)) {
      raycaster.setFromCamera(pointer, camera);
    }
  });

  React.useEffect(() => {
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
      <config.Contents />
      <Effects name={config.name} CustomEffects={config.CustomEffects} />
    </>
  );
};

const spectrumSelector = atom((get) => {
  const volume = get(volumeAtom);
  const bass = get(bassAtom);
  const midrange = get(midrangeAtom);
  const treble = get(trebleAtom);

  return { volume, bass, midrange, treble };
});

const GuiControls = ({ name }: { name: Config['name'] }) => {
  const setConfig = useSetAtom(setConfigAtom);
  const [audioEnabled, setAudioEnabled] = useAtom(audioEnabledAtom);
  const updateSpectrum = useSetAtom(updateSpectrumAtom);
  const [volumeScaler, setVolumeScaler] = useRefState(1);
  const [volumeThreshold, setVolumeThreshold] = useRefState(1);
  const audio = useMicrophone(audioEnabled);

  const [, setControl] = useControls(() => ({
    Contents: {
      value: name,
      options: Object.keys(scenes),
      onChange: (name: SceneName) => {
        if (name !== store.get(configAtom).name) {
          setConfig({ ...scenes[name] });
        }
      },
    },
    audio: folder({
      enabled: {
        value: audioEnabled,
        onChange: setAudioEnabled,
      },
      scale: { value: 1, min: 0, max: 5, onChange: setVolumeScaler },
      threshold: { value: 0, min: 0, max: 127, onChange: setVolumeThreshold },
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

  useFrame(() => {
    if (audio) {
      updateSpectrum(
        analyseSpectrum(audio, volumeThreshold.current, volumeScaler.current),
      );
    }
  });

  React.useEffect(() => {
    return store.sub(spectrumSelector, () => {
      setControl({
        volume: store.get(volumeAtom),
        bass: store.get(bassAtom),
        midrange: store.get(midrangeAtom),
        treble: store.get(trebleAtom),
      });
    });
  }, [setControl]);

  useMidiTwo(levaStore, 'audio.spectrum', {
    13: 'volume',
    14: 'bass',
    15: 'midrange',
    16: 'treble',
  });

  useMidi(
    React.useMemo(
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
  const config = useAtomValue(configAtom);

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
        controls={'controls' in config ? config.controls : true}
      >
        <React.Suspense fallback={null}>
          <Scene config={config} />
        </React.Suspense>
        <GuiControls name={config.name} />
      </FiberScene>
    </>
  );
};

export default function MixerPage({ name }: { name: SceneName }) {
  const maybeConfig = useAtomValue(maybeConfigAtom);
  const setConfig = useSetAtom(setConfigAtom);

  // Initialize function. When moving to React 18 this may be a problem if it is run twice.
  React.useEffect(() => {
    let cleanup = noop;
    initMidiController()
      .then((cleanupMidi) => {
        cleanup = cleanupMidi;
      })
      .catch((e: unknown) => {
        throw e;
      });
    return cleanup;
  }, []);

  React.useEffect(() => {
    setConfig(scenes[name]);
  }, [setConfig, name]);

  return (
    <Page>
      <video
        id="webcam"
        style={{ display: 'none' }}
        autoPlay
        playsInline
      ></video>
      {maybeConfig && <Mixer />}
    </Page>
  );
}
