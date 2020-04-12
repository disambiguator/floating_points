import * as THREE from 'three';
import { sample, sumBy, sum } from 'lodash';
import Page from './page';
import Scene from './scene';
import { useEffect } from 'react';
import { Dimensions } from '../lib/types';
import styled from 'styled-components';
import React from 'react';
import * as dat from 'dat.gui';

import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import ZoomShader from '../lib/shaders/zoom';
import SpiroShader from '../lib/shaders/spiro';

const numPoints = 50000;
const near = 0.1;
const far = 10000;
const renderSpeed = 1000;

const Controls = styled.div`
  position: absolute;
  margin: 10px;
  display: flex;
  align-items: center;
`;

interface SpiroUniforms {
  amplitude: THREE.Uniform;
  origin: THREE.Uniform;
  direction: THREE.Uniform;
  color: THREE.Uniform;
}

interface AfterImageUniforms {
  damp: THREE.Uniform;
}

const { uniforms } = SpiroShader;

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
  const vertices = [];
  for (let i = 0; i < renderSpeed; i++) {
    const points = positions.map((p) =>
      getPoint(p.radius, p.arc + i * p.speed, p.phi + i * p.phiSpeed),
    );

    const x = sumBy(points, 'x') / points.length;
    const y = sumBy(points, 'y') / points.length;
    const z = sumBy(points, 'z') / points.length;

    vertices.push(x, y, z);
  }

  return vertices;
}

const addToPresets = (seeds: Seed[]) =>
  window.fetch('/api/addPreset', {
    method: 'POST',
    body: JSON.stringify({ seeds }),
  });

const setGeometry = (geometry: THREE.BufferGeometry, p: Array<Seed>) => {
  geometry.attributes.position = new THREE.Float32BufferAttribute(
    generateVertices(p),
    3,
  );
  geometry.attributes.position.needsUpdate = true;
};

const initPositions = (geometry: THREE.BufferGeometry) => {
  const newPositions = [randPosition(), randPosition()];
  setGeometry(geometry, newPositions);

  return newPositions;
};

let presets: Array<{ positions: Array<string> }> = [];

const initFromPreset = async (geometry: THREE.BufferGeometry) => {
  const randomPreset = sample(presets);
  if (randomPreset == undefined) {
    throw new Error();
  }

  const response = await window.fetch(
    `/api/getPreset?ids=${JSON.stringify(randomPreset.positions)}`,
  );
  const jsonResponse = await response.json();
  const newPositions: Seed[] = await jsonResponse;
  setGeometry(geometry, newPositions);
  return newPositions;
};

const getInitialPresets = async () => {
  const response = await window.fetch('/api/getPresets');
  const json = await response.json();
  ({ presets } = json);
};

const getCamera = (props: Dimensions) => {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    45,
    props.width / props.height,
    near,
    far,
  );

  perspectiveCamera.position.set(0, 0, 300);
  perspectiveCamera.lookAt(0, 0, 0);

  return perspectiveCamera;
};

const renderer = (props: Dimensions) => {
  const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
  webGLRenderer.setSize(props.width, props.height);

  return webGLRenderer;
};

const updateRayCaster = (x: number, y: number, camera: THREE.Camera) => {
  const mouse = new THREE.Vector2(x, y);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  uniforms.origin.value = raycaster.ray.origin;
  uniforms.direction.value = raycaster.ray.direction;
};

interface Params {
  color: boolean;
  balance: number;
  pulse: boolean;
  audio: boolean;
}
const setUpGUI = ({
  uniforms,
  afterimageUniforms,
  zoomUniforms,
  params,
}: {
  uniforms: SpiroUniforms;
  afterimageUniforms: AfterImageUniforms;
  zoomUniforms: typeof ZoomShader.uniforms;
  params: Params;
}) => {
  const datGui = new dat.GUI({ autoPlace: true });
  datGui.open();
  datGui.add(uniforms.amplitude, 'value', 0, 0.005, 0.00001).name('Amplitude');
  datGui.add(afterimageUniforms.damp, 'value', 0.9, 1, 0.0001).name('Trails');
  datGui.add(zoomUniforms.zoom, 'value', 0.0, 2, 0.001).name('Zoom');
  datGui.add(params, 'balance', 0.0, 10000, 0.1).name('Balance');
  datGui.add(params, 'audio').name('Microphone Audio');
  datGui
    .add(params, 'color')
    .name('Color')
    .onChange(() => {
      uniforms.color.value = params.color ? 1.0 : 0.0;
    });
  datGui.add(params, 'pulse').name('Pulse');

  return datGui;
};

const Spiro = (props: Dimensions) => {
  const geometry = new THREE.BufferGeometry();
  let positions: Array<Seed> = initPositions(geometry);
  let seeds: Array<Seed> = [...positions];

  getInitialPresets();

  const camera = getCamera(props);
  const sceneRenderer = renderer(props);
  const material = new THREE.ShaderMaterial(SpiroShader);

  const params = {
    color: false,
    balance: 5000.0,
    pulse: false,
    audio: false,
  };

  const afterimagePass = new AfterimagePass();
  const afterimageUniforms = afterimagePass.uniforms as AfterImageUniforms;
  afterimageUniforms.damp.value = 0.95;

  const zoomPass = new ShaderPass(ZoomShader);
  const zoomUniforms = zoomPass.uniforms as typeof ZoomShader.uniforms;

  useEffect(() => {
    const gui = setUpGUI({
      uniforms,
      zoomUniforms,
      afterimageUniforms,
      params,
    });

    return () => {
      gui.destroy();
    };
  });

  let analyser: THREE.AudioAnalyser | null;
  useEffect(() => {
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
        analyser = new THREE.AudioAnalyser(audio, 32);
      });
  });

  const displacement = new Float32Array(renderSpeed);
  for (let i = 0; i < renderSpeed; i++) {
    displacement[i] = Math.random() * 5;
  }

  geometry.setAttribute(
    'displacement',
    new THREE.BufferAttribute(displacement, 1),
  );

  const line = new THREE.Line(geometry, material);

  updateRayCaster(0, 0, camera);

  const renderScene = () => {
    positions.forEach(function (p) {
      p.arc += p.speed * renderSpeed;
      p.phi += p.phiSpeed * renderSpeed;
    });
    geometry.attributes.position = new THREE.Float32BufferAttribute(
      generateVertices(positions),
      3,
    );
    geometry.attributes.position.needsUpdate = true;

    if (!analyser) return;
    const freq = analyser.getFrequencyData();
    if (params.pulse) {
      if (sum(freq) > params.balance) zoomUniforms.zoom.value = 0;
      zoomUniforms.zoom.value = (zoomUniforms.zoom.value + 0.1) % 5.0;
    } else {
      const value = sum(freq) / params.balance;
      zoomUniforms.zoom.value = value;
    }
  };

  const mouseMove = (event: React.MouseEvent) => {
    updateRayCaster(
      (event.clientX / props.width) * 2 - 1,
      -(event.clientY / props.height) * 2 + 1,
      camera,
    );
  };

  return (
    <div onMouseMove={mouseMove}>
      <Controls>
        <button onClick={() => addToPresets(seeds)}>Add to Presets</button>
        <button
          onClick={async () => {
            positions = await initPositions(geometry);
            seeds = [...positions];
          }}
        >
          New Positions
        </button>
        <button
          onClick={async () => {
            positions = await initFromPreset(geometry);
            seeds = [...positions];
          }}
        >
          Random Preset
        </button>
      </Controls>

      <Scene
        camera={camera}
        shapes={[line]}
        effects={[zoomPass, afterimagePass]}
        renderer={sceneRenderer}
        renderScene={renderScene}
        orbitControls
      />
    </div>
  );
};

export default () => {
  return (
    <Page>
      {(dimensions) => (
        <Spiro height={dimensions.height} width={dimensions.width} />
      )}
    </Page>
  );
};
