import { useFrame, useThree } from '@react-three/fiber';
import React from 'react';
import { BackSide, Color } from 'three';
import { Orbits } from 'components/orbits';
import MarbleShader from 'lib/shaders/marble';
import type { Config } from 'lib/store';
import Skull from 'models/Skull';

const orange = new Color(235 / 255, 97 / 255, 35 / 255);
const black = new Color(0, 0, 0);

const seeds = new Array(100).fill(undefined).map(() => {
  return {
    radius: 30 * Math.random() + 5,
    theta: 2 * Math.PI * Math.random(),
    phi: 2 * Math.PI * Math.random(),
    thetaSpeed: 1 * Math.random(),
    // thetaSpeed: 0,
    // phiSpeed: 2 * Math.random(),
    phiSpeed: 0,
  };
});

const colors = [
  new Color(166 / 255, 102 / 255, 255 / 255),
  new Color(56 / 255, 252 / 255, 59 / 255),
];

const lights = new Array(2).fill(undefined).map((_, i) => {
  return {
    radius: 40 * Math.random(),
    theta: 2 * Math.PI * Math.random(),
    phi: 2 * Math.PI * Math.random(),
    thetaSpeed: 0.5 * Math.random(),
    phiSpeed: 0,
    color: colors[i],
  };
});

const Halloween = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const shader = MarbleShader();

  useFrame(({ clock }) => {
    shader.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[40]} />
        <shaderMaterial
          args={[shader]}
          uniforms-aspect-value={viewport.aspect}
          uniforms-primaryColor-value={orange}
          uniforms-secondaryColor-value={black}
          side={BackSide}
        />
      </mesh>
      {seeds.map((s, i) => (
        <Orbits key={i} seed={s}>
          <Skull />
        </Orbits>
      ))}
      {lights.map((s, i) => (
        <Orbits key={i} seed={s}>
          <pointLight color={s.color} intensity={600} />
        </Orbits>
      ))}
    </>
  );
});

export const halloweenConfig = {
  name: 'halloween',
  Contents: Halloween,
} as const satisfies Config;
