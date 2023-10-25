import { useFrame, useLoader } from '@react-three/fiber';
import { button, useControls } from 'leva';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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

const lights = new Array(2).fill(undefined).map(() => {
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

const Skull = forwardRef(function Skull(_, ref: ForwardedRef<Object3D>) {
  const skull = useLoader(OBJLoader, assetUrl('/skull.obj')) as Object3D;

  return <primitive ref={ref} object={skull} />;
});

const Pumpkin = forwardRef(function Pumpkin(_, ref: ForwardedRef<Object3D>) {
  const pumpkin = useLoader(OBJLoader, assetUrl('/pumpkin.obj')) as Object3D;

  return <primitive scale={4} ref={ref} object={pumpkin} />;
});

const objects = [Skull, Pumpkin];

function Model() {
  const ref = useRef<Mesh>(null);
  const [Obj, setObj] = useState<(typeof objects)[0]>(Skull);
  const nextObject = useCallback(() => {
    setObj(
      (o: typeof Skull) => objects[(objects.indexOf(o) + 1) % objects.length],
    );
  }, [setObj]);
  const meshes = useRef<Mesh<any, MeshStandardMaterial>[]>([]);
  useEffect(() => {
    const m: Mesh<any, MeshStandardMaterial>[] = [];
    ref.current!.traverse((child) => {
      if (child instanceof Mesh) {
        const c = child as Mesh<any, MeshStandardMaterial>;
        m.push(c);
        c.material = new MeshStandardMaterial();
        c.material.clippingPlanes = [new Plane(new Vector3(0, 0, -1), 100)];
      }
    });
    meshes.current = m;
  }, [Obj]);

  useControls({
    model: button(nextObject),
  });

  // const prevConstant = useRef<number>(0);
  // const prevDir = useRef<'up' | 'down'>('up');
  const period = 3;
  useFrame(({ clock }) => {
    ref.current!.rotation.y = clock.elapsedTime;

    const constant = Math.sin((2 * Math.PI * clock.elapsedTime) / period);

    // const dir = constant > prevConstant.current ? 'up' : 'down';
    // const changedDirections = dir !== prevDir.current;
    // if (dir === 'up' && changedDirections) {
    //   nextObject();
    // }
    // prevConstant.current = constant;
    // prevDir.current = dir;

    meshes.current.forEach((m) => {
      m.material.clippingPlanes.forEach((plane) => {
        plane.constant = constant;
      });
    });
  });

  return <Obj ref={ref} />;
}

const Halloween = React.memo(function Dusen() {
  const groupRef = useRef<Group>(null);

  const [{ light }, setControl] = useControls(() => ({
    light: { min: 0, max: 100, value: 0 },
  }));

  useSpectrum({
    light: (v) => {
      setControl({ light: v * 0.1 });
    },
  });

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
          <Model />
        </React.Suspense>
      </group>
      {lights.map((s, i) => (
        <Orbits key={i} seed={s}>
          <pointLight color={s.color} intensity={s.intensity * light} />
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
