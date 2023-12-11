import { Effects, Text } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { AfterimagePass } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import defaultForwardUV from 'lib/shaders/defaultForwardUV.vert';
import fragmentShader from './19.frag';

extend({ AfterimagePass });

const TunnelShader = {
  uniforms: {
    damp: { value: 1 },
    xspeed: { value: 0.05 },
    yspeed: { value: 0.05 },
    trailNoiseAmplitude: { value: 0 },
    trailNoiseFrequency: { value: 0 },
    time: { value: 0 },
    tOld: { value: null },
    tNew: { value: null },
    angle: { value: 0 },
    aspect: { value: 0 },
  },
  vertexShader: defaultForwardUV,
  fragmentShader,
};

const Letter = ({ letter, angle }: { letter: string; angle: number }) => {
  const textRef = useRef<typeof Text>();

  return (
    <group rotation={[0, 0, angle]}>
      <Text
        position={[0.15, 0, 0]}
        ref={textRef}
        color={new THREE.Color(1, 0, 0)}
        outlineColor={new THREE.Color(0, 1, 0)}
        outlineWidth={0.003}
        anchorX="center"
        anchorY="middle"
      >
        {letter}
      </Text>
    </group>
  );
};

declare class AfterimagePassType extends AfterimagePass {
  uniforms: (typeof TunnelShader)['uniforms'];
}

const Postprocessing = () => {
  const viewport = useThree((t) => t.viewport);
  const effectsRef = useRef<AfterimagePassType>(null);
  useFrame(({ clock }) => {
    effectsRef.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <Effects>
      <afterimagePass
        ref={effectsRef}
        args={[0.96, TunnelShader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </Effects>
  );
};

export const Shapes = React.memo(function Shapes() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    groupRef.current!.rotation.z += 0.01;
  });

  const letters = 'GENUARY'.split('').map((l, i) => {
    return <Letter key={i} letter={l} angle={(-i * (2 * Math.PI)) / 7} />;
  });

  return (
    <>
      <group ref={groupRef}>{letters}</group>
      <Postprocessing />
    </>
  );
});

export default function Scene() {
  return (
    <Page background="black">
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene
          flat
          linear
          gl={{ antialias: true }}
          controls
          camera={{ far: 10000, position: [0, 0, 1] }}
        >
          <Shapes />
        </FiberScene>
      </div>
    </Page>
  );
}
