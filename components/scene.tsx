import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';

type Props = {
  renderer: THREE.WebGLRenderer;
  renderScene: () => void;
  orbitControls?: boolean;
  camera: THREE.Camera;
  shapes: Array<THREE.Mesh | THREE.Line>;
  effects?: Array<Pass>;
};

const Scene = (props: Props) => {
  const controls = props.orbitControls
    ? new OrbitControls(props.camera, props.renderer.domElement)
    : null;
  let frameId: number | null = null;
  const scene = new THREE.Scene();
  const ref = useRef<HTMLDivElement>(null);

  const render = (() => {
    if (props.effects) {
      const composer = new EffectComposer(props.renderer);
      composer.addPass(new RenderPass(scene, props.camera));

      props.effects.forEach(effect => {
        composer.addPass(effect);
      });

      return () => {
        composer.render();
      };
    } else {
      return () => {
        props.renderer.render(scene, props.camera);
      };
    }
  })();

  const animate = () => {
    props.renderScene();
    if (controls) {
      controls.update();
    }
    render();
    frameId = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (!frameId) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  const stop = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }
  };

  useEffect(() => {
    ref.current!.appendChild(props.renderer.domElement);

    start();
    props.shapes.forEach(shape => {
      scene.add(shape);
    });

    return stop;
  });

  return <div id="scene" ref={ref} />;
};

export default Scene;
