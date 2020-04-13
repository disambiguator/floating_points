import React from 'react';
import Scene from './scene';
import * as THREE from 'three';
import { Dimensions } from '../lib/types';
import Page from './page';

const generateCube = (length: number) => {
  const geometry = new THREE.BoxGeometry(length, length, length);
  // for ( var i = 0; i < geometry.faces.length; i ++ ) {
  //   geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
  // }

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.1,
    }),
  );
};

const camera = (width: number, height: number) => {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    10000,
  );
  perspectiveCamera.position.z = 300;
  perspectiveCamera.position.x = 300;
  perspectiveCamera.position.y = 300;

  return perspectiveCamera;
};

const renderer = (width: number, height: number) => {
  const webGLRenderer = new THREE.WebGLRenderer();
  webGLRenderer.setSize(width, height);

  return webGLRenderer;
};

const cubes = () => {
  const shapes = [];
  const increment = 30;
  let previousCube = generateCube(increment);
  shapes.push(previousCube);
  const direction = () => (Math.random() > 0.5 ? -1 : -1);
  for (let i = increment * 2; i < 500; i = i + increment) {
    const newCube = generateCube(i);
    newCube.position.x =
      previousCube.position.x + (direction() * increment) / 2;
    newCube.position.y =
      previousCube.position.y + (direction() * increment) / 2;
    newCube.position.z =
      previousCube.position.z + (direction() * increment) / 2;
    shapes.push(newCube);
    previousCube = newCube;
  }

  return shapes;
};

const CubeZoom = (props: Dimensions) => {
  const { width, height } = props;
  const sceneCamera = camera(width, height);
  const renderScene = () => {
    // sceneCamera.translateX(-1)
    sceneCamera.translateX(-0.5);
    sceneCamera.translateZ(-0.5);
  };

  return (
    <Scene
      camera={sceneCamera}
      shapes={cubes()}
      renderer={renderer(width, height)}
      renderScene={renderScene}
      orbitControls
    />
  );
};

export default () => (
  <Page>{(_dimensions) => <CubeZoom height={1200} width={1200} />}</Page>
);
