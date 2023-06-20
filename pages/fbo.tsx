import { Box, useFBO } from '@react-three/drei';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { AfterimagePass, EffectComposer, RenderPass } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const Shapes = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const material = new THREE.MeshStandardMaterial();

  useFrame(() => {
    groupRef.current.rotateX(-0.005);
    groupRef.current.rotateY(-0.005);
  });

  const cubes = Array(50)
    .fill(undefined)
    .map((_value, i) => {
      return (
        <Box
          key={i}
          args={[0.1, 0.1, 0.1]}
          position={[rand(-0.5, 0.5), rand(-0.5, 0.5), rand(-0.5, 0.5)]}
          material={material}
        >
          <meshStandardMaterial
            color={[Math.random(), Math.random(), Math.random()]}
          />
        </Box>
      );
    });

  return (
    <>
      <group ref={groupRef}>{cubes}</group>
      <pointLight position={[1, 1, 1]} />
    </>
  );
};

function ScreenQuadScene() {
  const target = useFBO();
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const { gl } = useThree();

  const bufferScene = new THREE.Scene();
  bufferScene.background = new THREE.Color('darkblue');

  const bufferCamera = new THREE.PerspectiveCamera(100, 1, 0.1, 100);

  const composer = new EffectComposer(gl, target);
  composer.renderToScreen = false;
  composer.addPass(new RenderPass(bufferScene, bufferCamera));
  composer.addPass(new AfterimagePass(0.97));

  useFrame(() => {
    composer.render();
    composer.swapBuffers();
  });

  return (
    <>
      <Box position={[0, 0, 0]}>
        <meshBasicMaterial ref={materialRef} map={target.texture} />
      </Box>
      {createPortal(<Shapes />, bufferScene)}
    </>
  );
}

export default function FBO() {
  return (
    <Page>
      <FiberScene controls>
        <ScreenQuadScene />
      </FiberScene>
    </Page>
  );
}
