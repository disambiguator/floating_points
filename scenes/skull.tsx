import { useFrame, useLoader } from '@react-three/fiber';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Plane,
  Vector3,
} from 'three';
import { OBJLoader } from 'three-stdlib';
import assetUrl from 'lib/assetUrl';
import { type Config, useSpectrum } from 'lib/store';
import { Orbits } from './halloween';

// const orange = new Color(235 / 255, 97 / 255, 35 / 255);

// const colors = [
//   new Color(166 / 255, 102 / 255, 255 / 255),
//   new Color(56 / 255, 252 / 255, 159 / 255),
// ];

const lights = new Array(10).fill(undefined).map(() => {
  return {
    radius: 4,
    theta: 2 * Math.PI * Math.random(),
    // phi: 2 * Math.PI * Math.random(),
    phi: 0,
    thetaSpeed: 3 * Math.random(),
    phiSpeed: 0,
    // color: colors[i],
    color: new Color(Math.random(), Math.random(), Math.random()),
    intensity: 100 / 10,
  };
});

useLoader.preload(OBJLoader, assetUrl('/pumpkin.obj'));
useLoader.preload(OBJLoader, assetUrl('/skull.obj'));

function Skull() {
  const ref = useRef<Mesh>(null);
  const pumpkin = useLoader(OBJLoader, assetUrl('/pumpkin.obj')) as Object3D;
  const skull = useLoader(OBJLoader, assetUrl('/skull.obj')) as Object3D;
  const objects = useMemo(() => [pumpkin, skull], [pumpkin, skull]);

  const [obj, setObj] = useState(skull);
  const nextObject = useCallback(() => {
    setObj((o) => {
      return objects[(objects.indexOf(o) + 1) % objects.length];
    });
  }, [setObj, objects]);

  const o = useMemo(() => obj.clone(), [obj]);
  const meshes = useMemo(() => {
    const m: Mesh<any, MeshStandardMaterial>[] = [];
    o.traverse((child) => {
      if (child instanceof Mesh) {
        const c = child as Mesh<any, MeshStandardMaterial>;
        m.push(c);
        c.material = new MeshStandardMaterial();
        // c.material.roughness = 0;
        c.material.clippingPlanes = [new Plane(new Vector3(0, 0, -1), 100)];
      }
    });
    return m;
  }, [o]);

  const prevConstant = useRef<number>(0);
  const prevDir = useRef<'up' | 'down'>('up');
  const period = 3;
  useFrame(({ clock }) => {
    ref.current!.rotation.y = clock.elapsedTime;

    const constant = Math.sin((2 * Math.PI * clock.elapsedTime) / period);

    const dir = constant > prevConstant.current ? 'up' : 'down';
    const changedDirections = dir !== prevDir.current;
    if (dir === 'up' && changedDirections) {
      nextObject();
    }
    prevConstant.current = constant;
    prevDir.current = dir;

    meshes.forEach((m) => {
      m.material.clippingPlanes.forEach((plane) => {
        plane.constant = constant;
      });
    });
  });

  return <primitive ref={ref} object={o} />;
}

const Halloween = React.memo(function Dusen() {
  const groupRef = useRef<Group>(null);

  const setSize = useCallback((v: number) => {
    groupRef.current!.scale.set(v, v, v);
  }, []);

  useSpectrum({
    size: setSize,
  });

  return (
    <>
      <group ref={groupRef}>
        <React.Suspense fallback={null}>
          <Skull />
        </React.Suspense>
      </group>
      {lights.map((s, i) => (
        <Orbits key={i} seed={s}>
          <pointLight color={s.color} intensity={s.intensity} />
        </Orbits>
      ))}
      {/* <pointLight color={orange} position={[0, 0, 10]} intensity={600} /> */}
    </>
  );
});

export const skullConfig: Config = {
  name: 'skull',
  Contents: Halloween,
  params: {},
};
