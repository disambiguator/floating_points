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
import { Effects } from './effects';
import WebMidi from 'webmidi';
import NewWindow from 'react-new-window';
import { State, useStore } from '../lib/store';
import { sceneName, scenes } from './scenes';
import { useRouter } from 'next/router';
import { analyseSpectrum, useMicrophone } from '../lib/audio';

type MidiParam = 'noiseAmplitude' | 'trails' | 'zoomThreshold' | 'kaleidoscope';

export interface BaseConfig {
  color: boolean;
  zoomThreshold: number;
  audioEnabled: boolean;
  noiseAmplitude: number;
  trails: number;
  kaleidoscope: number;
  volumeControl?: MidiParam;
  volumeScaler: number;
  name: sceneName;
}

type CustomControls<T> = (props: {
  params: T;
  onUpdate: (newData: Partial<T>) => void;
}) => Array<React.ReactNode>;

type SceneContents<T> = React.ComponentType<{ config: T }>;

export type CustomEffectsType<T> = React.ComponentType<{ params: T }>;

export type Config<T> = {
  params: BaseConfig & T;
  CustomEffects?: CustomEffectsType<BaseConfig & T>;
  controls?: CustomControls<BaseConfig & T>;
  Contents: SceneContents<BaseConfig & T>;
};

export const defaultConfig = {
  trails: 0,
  noiseAmplitude: 0.0,
  zoomThreshold: 0,
  color: false,
  pulseEnabled: false,
  audioEnabled: false,
  kaleidoscope: 0,
  volumeScaler: 1,
};

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

export const Controls = <T extends BaseConfig>({
  params,
  setParams,
  customControls,
  changeScene,
}: {
  params: T;
  changeScene: (name: sceneName) => void;
  setParams: (params: T) => void;
  customControls?: CustomControls<T>;
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
            setParams({ ...params, ...newValue });
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
      params={params}
      setParams={setParams}
      customControls={customControls}
      poppedOut={poppedOut}
      changeScene={changeScene}
      setPoppedOut={setPoppedOut}
    />
  );

  return poppedOut ? <NewWindow>{controlPanel}</NewWindow> : controlPanel;
};

export const DatMidi = (props: Pick<DatNumberProps, 'path' | 'label'>) => (
  <DatNumber {...props} min={0} step={1} max={127} />
);

export const scaleMidi = (midi: number, min: number, max: number) => {
  return min + (midi * (max - min)) / 127;
};

const ControlPanel = <T extends BaseConfig>({
  params,
  setParams,
  poppedOut,
  setPoppedOut,
  customControls,
  changeScene,
}: {
  params: T;
  setParams: (arg0: T) => void;
  poppedOut: boolean;
  changeScene: (name: sceneName) => void;
  setPoppedOut: (arg0: boolean) => void;
  customControls?: CustomControls<T>;
}) => {
  const [isOpen, setOpen] = useState(true);
  const spectrum = useStore((state: State) => state.spectrum);
  const onUpdate = (newData: Partial<T>) => {
    if (newData.name && newData.name !== params.name) {
      changeScene(newData.name);
    } else {
      setParams({ ...params, ...newData });
    }
  };

  return isOpen ? (
    <DatGui
      data={{ ...params, ...spectrum }}
      onUpdate={onUpdate}
      style={{ zIndex: 1 }}
    >
      <DatSelect path="name" label="Contents" options={Object.keys(scenes())} />
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
      {params.audioEnabled && [
        /* eslint-disable react/jsx-key */
        <DatMidi label="Volume" path="volume" />,
        <DatNumber
          label="Scale"
          path="volumeScaler"
          min={0}
          max={2}
          step={0.0001}
        />,
        <DatMidi label="Sub Bass" path="subBass" />,
        <DatMidi label="Bass" path="bass" />,
        <DatMidi label="Midrange" path="midrange" />,
        <DatMidi label="Treble" path="treble" />,
        <DatSelect
          path="volumeControl"
          label="Volume Control"
          options={[
            undefined,
            'noiseAmplitude',
            'trails',
            'zoomThreshold',
            'kaleidoscope',
            'speed',
            'lineWidth',
          ]}
          /* eslint-enable react/jsx-key */
        />,
      ]}
      <DatBoolean path="color" label="Color" />
      {customControls && customControls({ params, onUpdate })}
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
    <DatGui data={params} onUpdate={onUpdate} style={{ zIndex: 1 }}>
      <DatButton
        onClick={() => {
          setOpen(true);
        }}
        label="Open"
      />
    </DatGui>
  );
};

const Scene = <T extends BaseConfig>({
  params,
  setParams,
  Contents,
  CustomEffects,
}: {
  params: T;
  setParams: (params: T) => void;
  Contents: SceneContents<T>;
  CustomEffects?: CustomEffectsType<T>;
}) => {
  const { camera, mouse } = useThree();
  const raycaster = new THREE.Raycaster();

  const audio = useMicrophone(params.audioEnabled);

  useFrame(() => {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    useStore.setState({ ray: raycaster.ray });

    if (audio) {
      const spectrum = analyseSpectrum(audio);
      const { volume } = spectrum;

      if (params.volumeControl) {
        const volumeControlledValue = {} as Record<MidiParam, number>;
        volumeControlledValue[params.volumeControl] =
          volume * params.volumeScaler;
        setParams({ ...params, ...volumeControlledValue });
      }

      useStore.setState({ spectrum });
    }
  });

  return (
    <>
      <Contents config={params} />
      <Effects params={params} CustomEffects={CustomEffects} />
    </>
  );
};

const Mixer = <T,>(props: { config: Config<T> }) => {
  const router = useRouter();
  let initialProps = props.config;
  const routerParams = router.query.params as string;
  if (routerParams) {
    const parsedParams = JSON.parse(routerParams) as Config<T>['params'];
    //@ts-ignore
    initialProps = {
      ...scenes()[parsedParams.name],
      params: parsedParams,
    };
  }
  const [config, setConfig] = useState<Config<T>>(initialProps);
  const { params } = config;
  const setParams = (params: Config<T>['params']) => {
    setConfig({ ...config, params });
  };

  useEffect(() => {
    const url = `/mixer?params=${JSON.stringify(params)}`;
    window.history.pushState('', '', url);
  }, [params]);

  const changeScene = (name: sceneName) => {
    const newScene = scenes()[name];
    //@ts-ignore
    setConfig({
      ...newScene,
      params: { ...config.params, ...newScene.params },
    });
  };

  return (
    <>
      <Controls
        params={params}
        setParams={setParams}
        changeScene={changeScene}
        customControls={config.controls}
      />
      <FiberScene
        camera={{ far: 10000, position: [0, 0, 300] }}
        gl={{ antialias: true }}
        controls={params.name !== 'cubefield'}
      >
        <Scene
          params={params}
          setParams={setParams}
          Contents={config.Contents}
          CustomEffects={config.CustomEffects}
        />
      </FiberScene>
    </>
  );
};

export default function MixerPage<T>({ config }: { config: Config<T> }) {
  return (
    <Page>
      <Mixer config={config} />
    </Page>
  );
}
