import { useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { BackSide, Color, Group } from 'three';
import { OBJLoader } from 'three-stdlib';
import assetUrl from 'lib/assetUrl';
import shader from 'lib/shaders/marble';
import type { Config } from 'lib/store';

const orange = new Color(235 / 255, 97 / 255, 35 / 255);
const black = new Color(0, 0, 0);

function Skull() {
  const obj = useLoader(OBJLoader, assetUrl('/skull.obj'));
  return <primitive object={obj.clone()} />;
}

export type Seed = {
  radius: number;
  theta: number;
  phi: number;
  thetaSpeed: number;
  phiSpeed: number;
  // color: string;
};

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

const Orbits = ({
  seed: { thetaSpeed, theta, phi, phiSpeed, radius },
  children,
}: {
  seed: Seed;
  children: JSX.Element;
}) => {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.z = -theta - clock.elapsedTime * thetaSpeed;
    groupRef.current.rotation.y = phi + clock.elapsedTime * phiSpeed;
  });

  return (
    <group ref={groupRef} rotation={[theta, phi, 0]}>
      <group position={[radius, 0, 0]}>{children}</group>
    </group>
  );
};

const Halloween = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const ref = useRef<typeof shader>();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[40]} />
        <shaderMaterial
          ref={ref}
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
          <pointLight color={s.color} intensity={0.7} />
        </Orbits>
      ))}
    </>
  );
});

export const halloweenConfig: Config = {
  name: 'halloween',
  Contents: Halloween,
  params: {},
};
