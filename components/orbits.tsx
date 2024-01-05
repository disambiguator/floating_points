import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';

export type Seed = {
  radius: number;
  theta: number;
  phi: number;
  thetaSpeed: number;
  phiSpeed: number;
  // color: string;
};

export const Orbits = ({
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
