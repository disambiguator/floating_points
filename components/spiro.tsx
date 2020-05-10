import * as THREE from 'three';
import { sumBy } from 'lodash';
import Page from './page';
import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import SpiroShader from '../lib/shaders/spiro';
import { useThree, useFrame } from 'react-three-fiber';
import { FiberScene } from './scene';
import { DatButton } from 'react-dat-gui';
import { Audio, Effects, BaseConfig } from './effects';
import { useRouter } from 'next/router';
import { Controls, scaleMidi } from './mixer';

const numPoints = 50000;
const renderSpeed = 1000;

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

export const initPositions = () => [randPosition(), randPosition()];

interface SpirographProps {
  seeds?: Seed[];
  config: SpiroConfig;
  ray: THREE.Ray;
}
export const SpiroContents = ({ config, ray }: SpirographProps) => {
  const { clock } = useThree();
  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, []);

  const { seeds, color, noiseAmplitude } = config;

  const [positions, setPositions] = useState(seeds ?? initPositions());

  useEffect(() => {
    setPositions(seeds);
  }, [seeds]);

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
        uniforms-color-value={color}
        uniforms-origin-value={ray.origin}
        uniforms-direction-value={ray.direction}
        uniforms-amplitude-value={scaleMidi(noiseAmplitude, 0, 0.0005)}
        uniforms-time-value={clock.elapsedTime}
        attach="material"
      />
    </line>
  );
};

interface SceneProps {
  config: SpiroConfig;
}

const Scene = ({ config }: SceneProps) => {
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
      <SpiroContents config={config} ray={ray} />
      <Effects config={config} audio={audio} />
    </>
  );
};

export interface SpiroConfig extends BaseConfig {
  contents: 'spiro';
  seeds: Seed[];
}

export const SpiroControls = ({
  onUpdate,
}: {
  onUpdate: (newData: Partial<SpiroConfig>) => void;
}) => {
  return (
    <DatButton
      onClick={() => {
        const newSeeds = initPositions();
        onUpdate({ seeds: newSeeds });
        const url = `/spiro?seeds=${JSON.stringify(newSeeds)}`;
        window.history.pushState('', '', url);
      }}
      label="New Positions"
    />
  );
};

const Spiro = () => {
  const router = useRouter();
  const urlSeeds = router.query.seeds as string | undefined;
  const [config, setConfig] = useState<SpiroConfig>({
    trails: 0.93,
    noiseAmplitude: 0.0,
    zoomThreshold: 0.0,
    color: false,
    pulseEnabled: false,
    audioEnabled: false,
    kaleidoscope: 0,
    contents: 'spiro',
    seeds: urlSeeds ? JSON.parse(urlSeeds) : initPositions(),
  });

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

export default () => {
  return <Page>{(_dimensions) => <Spiro />}</Page>;
};
