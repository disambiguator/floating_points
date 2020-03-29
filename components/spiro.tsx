import * as THREE from 'three';
import { sample, sumBy } from 'lodash';
import Page from './page';
import Scene from './scene';
import { useEffect } from 'react';
import { Dimensions } from '../lib/types';
import styled from 'styled-components';
import React from 'react';
import * as dat from 'dat.gui';

import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

const numPoints = 50000;
const near = 0.1;
const far = 10000;
const geometry = new THREE.BufferGeometry();
const renderSpeed = 1000;
let positions: Array<Seed> = [];

const Controls = styled.div`
  position: absolute;
  margin: 10px;
  display: flex;
  align-items: center;
`;

const vertexShader = /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float amplitude;
    uniform vec3 origin;
    uniform vec3 direction;
    uniform float color;
    attribute float displacement;

    varying vec3 vPosition;
    varying float vColor;

    float computeDistance(vec3 mouseOrigin, vec3 mouseDirection, vec3 vertexPosition) {
      vec3 d = normalize(mouseDirection);
      vec3 v = vertexPosition - mouseOrigin;
      float t = dot(v, d);
      vec3 P = mouseOrigin + t * d;
      return distance(P, vertexPosition);
    }

    void main() {

    vPosition = position;
    vColor = color;

    vec3 newPosition = position + amplitude * displacement * pow(computeDistance(origin, direction, position),2.) * direction;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition,1.0);
    }
`;

const fragmentShader = /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    // same name and type as VS
    varying vec3 vPosition;
    varying float vColor;

    void main() {

    vec3 color = vColor * normalize(vPosition) + (1. - vColor) * vec3(1.0);

    // feed into our frag colour
    gl_FragColor = vec4(color, 1.0);

    }
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

const uniforms = {
  amplitude: new THREE.Uniform(0.0),
  origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  color: new THREE.Uniform(0.0),
};

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

function generateVertices() {
  const vertices = [];
  for (let i = 0; i < renderSpeed; i++) {
    const points = positions.map(p => getPoint(p.radius, p.arc, p.phi));

    positions.forEach(function(p) {
      p.arc += p.speed;
      p.phi += p.phiSpeed;
    });

    const x = sumBy(points, 'x') / points.length;
    const y = sumBy(points, 'y') / points.length;
    const z = sumBy(points, 'z') / points.length;

    vertices.push(x, y, z);
  }

  return vertices;
}

let seeds: Array<Seed> = [];

const addToPresets = () =>
  window.fetch('/api/addPreset', {
    method: 'POST',
    body: JSON.stringify({ seeds }),
  });

const setPositions = (p: Array<Seed>) => {
  positions = p;
  geometry.attributes.position = new THREE.Float32BufferAttribute(
    generateVertices(),
    3,
  );
  geometry.attributes.position.needsUpdate = true;
};

const initPositions = () => {
  seeds = [randPosition(), randPosition()];
  setPositions([...seeds]);
};

let presets: Array<{ positions: Array<string> }> = [];

const initFromPreset = async () => {
  const randomPreset = sample(presets);
  if (randomPreset == undefined) {
    throw new Error();
  }

  const response = await window.fetch(
    `/api/getPreset?ids=${JSON.stringify(randomPreset.positions)}`,
  );
  const jsonResponse = await response.json();
  setPositions(await jsonResponse);
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

const setUpGUI = (
  uniforms: SpiroUniforms,
  postProcessUniforms: AfterImageUniforms,
) => {
  const params = {
    color: false,
  };

  const datGui = new dat.GUI({ autoPlace: true });
  datGui.open();
  datGui.add(uniforms.amplitude, 'value', 0, 0.005, 0.00001).name('Amplitude');
  datGui.add(postProcessUniforms.damp, 'value', 0.7, 1, 0.0001).name('Trails');
  datGui
    .add(params, 'color')
    .name('Color')
    .onChange(() => {
      uniforms.color.value = params.color ? 1.0 : 0.0;
    });

  return datGui;
};

const Spiro = (props: Dimensions) => {
  initPositions();
  getInitialPresets();

  const camera = getCamera(props);
  const sceneRenderer = renderer(props);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const afterimagePass = new AfterimagePass();

  const postProcessUniforms = afterimagePass.uniforms as AfterImageUniforms;
  postProcessUniforms.damp.value = 0.9;

  useEffect(() => {
    const gui = setUpGUI(uniforms, postProcessUniforms);

    return () => {
      gui.destroy();
    };
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
    geometry.attributes.position = new THREE.Float32BufferAttribute(
      generateVertices(),
      3,
    );
    geometry.attributes.position.needsUpdate = true;
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
        <button onClick={addToPresets}>Add to Presets</button>
        <button onClick={initPositions}>New Positions</button>
        <button onClick={initFromPreset}>Random Preset</button>
      </Controls>

      <Scene
        camera={camera}
        shapes={[line]}
        effects={[afterimagePass]}
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
      {dimensions => (
        <Spiro height={dimensions.height} width={dimensions.width} />
      )}
    </Page>
  );
};
