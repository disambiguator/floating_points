import * as THREE from 'three';
import { sumBy, sum } from 'lodash';
import Page from './page';
import { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import React from 'react';
import SpiroShader from '../lib/shaders/spiro';
import ZoomShader from '../lib/shaders/zoom';

import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import {
  useThree,
  useFrame,
  extend,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ReactThreeFiber,
} from 'react-three-fiber';
import { FiberScene } from './scene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import DatGui, { DatNumber, DatBoolean } from 'react-dat-gui';
import { KaleidoscopeShader } from '../lib/shaders/kaleidoscope';

extend({ EffectComposer, ShaderPass, RenderPass, AfterimagePass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      effectComposer: ReactThreeFiber.Object3DNode<
        EffectComposer,
        typeof EffectComposer
      >;
      renderPass: ReactThreeFiber.Object3DNode<RenderPass, typeof RenderPass>;
      shaderPass: ReactThreeFiber.Object3DNode<ShaderPass, typeof ShaderPass>;
      afterimagePass: ReactThreeFiber.Object3DNode<
        AfterimagePass,
        typeof AfterimagePass
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const numPoints = 50000;
const renderSpeed = 1000;

const Controls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin: 10px;
  display: flex;
  align-items: center;
  z-index: 1;
`;

interface AfterImageUniforms {
  damp: THREE.Uniform;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

export interface Seed {
  radius: number;
  arc: number;
  phi: number;
  speed: number;
  phiSpeed: number;
}

const randPosition = (): Seed => ({
  radius: randInt(50, 300),
  arc: randInt(0, 360),
  phi: randInt(0, 360),
  speed: (randInt(1, 10) * 360) / (randInt(10, 100) + numPoints),
  phiSpeed: 0,
});

const getPoint = (radius: number, theta: number, phi: number) => {
  const xCoordinate = radius * Math.sin(theta) * Math.cos(phi);
  const yCoordinate = radius * Math.cos(theta) * Math.sin(phi);
  const zCoordinate = radius * Math.cos(theta);
  return { x: xCoordinate, y: yCoordinate, z: zCoordinate };
};

function generateVertices(positions: Seed[]) {
  const vertices = new Float32Array(renderSpeed * 3);
  for (let i = 0; i < renderSpeed; i++) {
    const points = positions.map((p) =>
      getPoint(p.radius, p.arc + i * p.speed, p.phi + i * p.phiSpeed),
    );

    const x = sumBy(points, 'x') / points.length;
    const y = sumBy(points, 'y') / points.length;
    const z = sumBy(points, 'z') / points.length;

    vertices[i * 3] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;
  }
  return vertices;
}

const initPositions = () => [randPosition(), randPosition()];

interface EffectsProps {
  config: Config;
  audio: Audio | undefined;
}
const Effects = ({ config, audio }: EffectsProps) => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>();
  const [zoom, setZoom] = useState(config.zoomThreshold);
  const { trails } = config;

  useEffect(() => {
    composer.current!.setSize(size.width, size.height);
  }, [size]);

  useEffect(() => {
    if (!config.pulseEnabled && !config.audioEnabled) {
      setZoom(config.zoomThreshold);
    }
  }, [config.zoomThreshold]);

  useFrame(() => {
    if (config.pulseEnabled) {
      setZoom((zoom + 0.1) % config.zoomThreshold);
    } else if (config.audioEnabled && audio) {
      const { analyser } = audio;
      const freq = analyser.getFrequencyData();
      setZoom(sum(freq) / config.zoomThreshold / 1000);
    }

    composer.current!.render();
  }, 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <afterimagePass attachArray="passes" uniforms-damp-value={trails} />
      <shaderPass
        attachArray="passes"
        args={[ZoomShader]}
        uniforms-zoom-value={zoom}
      />
      {config.flipEnabled ? (
        <shaderPass attachArray="passes" args={[KaleidoscopeShader]} />
      ) : null}
    </effectComposer>
  );
};

interface Config {
  color: boolean;
  zoomThreshold: number;
  pulseEnabled: boolean;
  audioEnabled: boolean;
  noiseAmplitude: number;
  trails: number;
  flipEnabled: boolean;
}
const ControlPanel = ({
  config,
  setConfig,
}: {
  config: Config;
  setConfig: (arg0: Config) => void;
}) => {
  const onUpdate = (newData: Partial<Config>) => {
    setConfig({ ...config, ...newData });
  };

  return (
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
        max={10}
        step={0.001}
      />
      <DatBoolean path="audioEnabled" label="Microphone Audio" />
      <DatBoolean path="color" label="Color" />
      <DatBoolean path="pulseEnabled" label="Pulse" />
      <DatBoolean path="flipEnabled" label="Flip" />
    </DatGui>
  );
};

interface SceneProps {
  seeds: Seed[];
  config: Config;
}

interface Audio {
  analyser: THREE.AudioAnalyser;
  listener: THREE.AudioListener;
  stream: MediaStream;
}
const Scene = ({ seeds, config }: SceneProps) => {
  const { camera, mouse } = useThree();
  const [positions, setPositions] = useState(seeds);
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

  useEffect(() => {
    setPositions(seeds);
  }, [seeds]);

  const ray = (() => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    return raycaster.ray;
  })();

  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, undefined);

  useFrame(() => {
    setPositions(
      positions.map((p) => ({
        ...p,
        arc: p.arc + p.speed * renderSpeed,
        phi: p.phi + p.phiSpeed * renderSpeed,
      })),
    );
  });

  return (
    <>
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={['attributes', 'displacement']}
            count={renderSpeed}
            array={displacement}
            itemSize={1}
          />
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={renderSpeed}
            array={generateVertices(positions)}
            onUpdate={(self) => {
              self.needsUpdate = true;
            }}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          args={[SpiroShader]}
          uniforms-color-value={config.color ? 1.0 : 0.0}
          uniforms-origin-value={ray.origin}
          uniforms-direction-value={ray.direction}
          uniforms-amplitude-value={config.noiseAmplitude}
          attach="material"
        />
        <Effects config={config} audio={audio} />
      </line>
    </>
  );
};

const Spiro = () => {
  const [seeds, setSeeds] = useState(initPositions());
  const [config, setConfig] = useState({
    trails: 0.93,
    noiseAmplitude: 0.0,
    zoomThreshold: 0.0,
    color: false,
    pulseEnabled: false,
    audioEnabled: false,
    flipEnabled: false,
  });

  return (
    <>
      <Controls>
        <button
          onClick={() => {
            setSeeds(initPositions());
          }}
        >
          New Positions
        </button>
      </Controls>
      <ControlPanel config={config} setConfig={setConfig} />
      <FiberScene
        camera={{ far: 10000, position: [0, 0, 300] }}
        gl={{ antialias: true }}
      >
        <Scene seeds={seeds} config={config} />
      </FiberScene>
    </>
  );
};

export default () => {
  return <Page>{(_dimensions) => <Spiro />}</Page>;
};
