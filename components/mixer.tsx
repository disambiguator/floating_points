import * as THREE from 'three';
import Page from './page';
import { useState, useEffect } from 'react';
import React from 'react';
import { useThree, useFrame } from 'react-three-fiber';
import { FiberScene } from './scene';
import DatGui, {
  DatNumber,
  DatBoolean,
  DatButton,
  DatSelect,
  DatNumberProps,
} from 'react-dat-gui';
import { Config, Audio, Effects } from './effects';
import { Shapes } from './geometric_chaos';
import { SpiroContents, SpiroControls } from './spiro';
import { Dusen } from './dusen';
import WebMidi from 'webmidi';
import NewWindow from 'react-new-window';

const MAPPINGS: Record<
  string,
  Record<number, 'noiseAmplitude' | 'trails' | 'zoomThreshold' | 'kaleidoscope'>
> = {
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

const SceneControls = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (newData: Partial<Config>) => void;
}) => {
  if (config.contents === 'spiro') {
    return <SpiroControls onUpdate={onUpdate} />;
  } else {
    return null;
  }
};

export const Controls = <T extends Config>({
  config,
  setConfig,
}: {
  config: T;
  setConfig: React.Dispatch<React.SetStateAction<T>>;
}) => {
  const [poppedOut, setPoppedOut] = useState(false);

  useEffect(() => {
    WebMidi.enable(() => {
      WebMidi.inputs.forEach((input) => {
        const mapping = MAPPINGS[input.name];
        if (!mapping) return;

        input.addListener('controlchange', 'all', (e) => {
          const param = mapping[e.controller.number];
          if (param) {
            const newValue: Partial<T> = {};
            newValue[param] = e.value;
            setConfig((oldConfig) => ({ ...oldConfig, ...newValue }));
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
  }, []);

  const controlPanel = (
    <ControlPanel
      config={config}
      setConfig={setConfig}
      poppedOut={poppedOut}
      setPoppedOut={setPoppedOut}
    />
  );

  return poppedOut ? <NewWindow>{controlPanel}</NewWindow> : controlPanel;
};

const DatMidi = (props: Pick<DatNumberProps, 'path' | 'label'>) => (
  <DatNumber {...props} min={0} step={1} max={127} />
);

export const scaleMidi = (midi: number, min: number, max: number) => {
  return min + (midi * (max - min)) / 127;
};

const ControlPanel = <T extends Config>({
  config,
  setConfig,
  poppedOut,
  setPoppedOut,
}: {
  config: T;
  setConfig: (arg0: T) => void;
  poppedOut: boolean;
  setPoppedOut: (arg0: boolean) => void;
}) => {
  const [isOpen, setOpen] = useState(true);
  const onUpdate = (newData: Partial<Config>) => {
    setConfig({ ...config, ...newData });
  };

  return isOpen ? (
    <DatGui data={config} onUpdate={onUpdate} style={{ zIndex: 1 }}>
      <DatMidi path="noiseAmplitude" label="Amplitude" />
      <DatMidi path="trails" label="Trails" />
      <DatMidi path="zoomThreshold" label="Zoom" />
      <DatNumber
        path="kaleidoscope"
        label="Kaleidoscope"
        min={0}
        max={127}
        step={1}
      />
      <DatBoolean path="audioEnabled" label="Microphone Audio" />
      <DatBoolean path="color" label="Color" />
      <DatBoolean path="pulseEnabled" label="Pulse" />
      <DatSelect
        path="contents"
        label="Contents"
        options={['spiro', 'chaos', 'dusen']}
      />
      <SceneControls config={config} onUpdate={onUpdate} />
      <DatButton
        onClick={() => {
          setPoppedOut(!poppedOut);
        }}
        label={poppedOut ? 'Pop In' : 'Pop Out'}
      />
      <DatButton
        onClick={() => {
          setOpen(false);
        }}
        label="Close"
      />
    </DatGui>
  ) : (
    <DatGui data={config} onUpdate={onUpdate} style={{ zIndex: 1 }}>
      <DatButton
        onClick={() => {
          setOpen(true);
        }}
        label="Open"
      />
    </DatGui>
  );
};

const SceneContents = ({ config, ray }: { config: Config; ray: THREE.Ray }) => {
  if (config.contents === 'spiro') {
    return <SpiroContents config={config} ray={ray} />;
  } else if (config.contents === 'dusen') {
    return <Dusen config={config} />;
  } else {
    return <Shapes amplitude={config.noiseAmplitude * 1000} ray={ray} />;
  }
};

const Scene = ({ config }: { config: Config }) => {
  const { camera, mouse } = useThree();
  const [audio, setAudio] = useState<Audio>();

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);

  const [ray, setRay] = useState(raycaster.ray);

  useEffect(() => {
    if (config.audioEnabled) {
      const listener = new THREE.AudioListener();
      camera.add(listener);

      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream: MediaStream) => {
          const audio = new THREE.Audio(listener);

          const { context } = listener;
          const source = context.createMediaStreamSource(stream);

          // @ts-ignore
          audio.setNodeSource(source);
          setAudio({
            analyser: new THREE.AudioAnalyser(audio, 32),
            listener,
            stream,
          });
        });
    } else {
      if (audio) {
        camera.remove(audio.listener);
        audio.stream.getTracks().forEach(function (track) {
          track.stop();
        });
      }
    }
  }, [config.audioEnabled]);

  useFrame(() => {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    setRay(raycaster.ray);
  });

  return (
    <>
      <SceneContents config={config} ray={ray} />
      <Effects config={config} audio={audio} />
    </>
  );
};

const Mixer = <T extends Config>(props: { config: T }) => {
  const [config, setConfig] = useState<T>(props.config);

  return (
    <>
      <Controls config={config} setConfig={setConfig} />
      <FiberScene
        camera={{ far: 10000, position: [0, 0, 300] }}
        gl={{ antialias: true }}
      >
        <Scene config={config} />
      </FiberScene>
    </>
  );
};

export default ({ config }: { config: Config }) => {
  return <Page>{(_dimensions) => <Mixer config={config} />}</Page>;
};
