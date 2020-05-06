import * as THREE from 'three';
import Page from './page';
import { useState, useEffect } from 'react';
import React from 'react';
import { useThree } from 'react-three-fiber';
import { FiberScene } from './scene';
import DatGui, {
  DatNumber,
  DatBoolean,
  DatButton,
  DatSelect,
} from 'react-dat-gui';
import { Config, Audio, Effects } from './effects';
import { Shapes } from './geometric_chaos';
import { SpiroContents, SpiroControls, initPositions } from './spiro';

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

export const ControlPanel = <T extends Config>({
  config,
  setConfig,
}: {
  config: T;
  setConfig: (arg0: T) => void;
}) => {
  const [isOpen, setOpen] = useState(true);
  const onUpdate = (newData: Partial<Config>) => {
    setConfig({ ...config, ...newData });
  };

  return isOpen ? (
    <DatGui data={config} onUpdate={onUpdate} style={{ zIndex: 1 }}>
      <DatNumber
        path="noiseAmplitude"
        label="Amplitude"
        min={0}
        step={0.000001}
        max={0.00025}
      />
      <DatNumber path="trails" label="Trails" min={0.9} max={1} step={0.0001} />
      <DatNumber
        path="zoomThreshold"
        label="Zoom"
        min={0}
        max={0.5}
        step={0.0001}
      />
      <DatBoolean path="audioEnabled" label="Microphone Audio" />
      <DatBoolean path="color" label="Color" />
      <DatBoolean path="pulseEnabled" label="Pulse" />
      <DatNumber
        path="kaleidoscope"
        label="Kaleidoscope"
        min={0}
        max={50}
        step={1}
      />
      <DatSelect path="contents" options={['spiro', 'chaos']} />
      <SceneControls config={config} onUpdate={onUpdate} />
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
  } else {
    return <Shapes amplitude={config.noiseAmplitude * 1000} ray={ray} />;
  }
};

const Scene = ({ config }: { config: Config }) => {
  const { camera, mouse } = useThree();
  const [audio, setAudio] = useState<Audio>();

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

  const ray = (() => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    return raycaster.ray;
  })();

  return (
    <>
      <SceneContents config={config} ray={ray} />
      <Effects config={config} audio={audio} />
    </>
  );
};

const Mixer = () => {
  const [config, setConfig] = useState<Config>({
    trails: 0.93,
    noiseAmplitude: 0.0,
    zoomThreshold: 0.0,
    color: false,
    pulseEnabled: false,
    audioEnabled: false,
    kaleidoscope: 0,
    contents: 'spiro',
    seeds: initPositions(),
  });

  return (
    <>
      <ControlPanel config={config} setConfig={setConfig} />
      <FiberScene
        camera={{ far: 10000, position: [0, 0, 300] }}
        gl={{ antialias: true }}
      >
        <Scene config={config} />
      </FiberScene>
    </>
  );
};

export default () => {
  return <Page>{(_dimensions) => <Mixer />}</Page>;
};
