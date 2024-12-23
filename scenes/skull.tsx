import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import React from 'react';
import {
  Color,
  Group,
  MeshStandardMaterial,
  Plane,
  PointLight,
  Vector3,
} from 'three';
import { Orbits } from 'components/orbits';
import { type Config, useSpectrum } from 'lib/store';
import Bat from 'models/Bat';
import Ghost from 'models/Ghost';
import Pumpkin from 'models/Pumpkin';
import Skull from 'models/Skull';

// const orange = new Color(235 / 255, 97 / 255, 35 / 255);

// const colors = [
//   new Color(166 / 255, 102 / 255, 255 / 255),
//   new Color(56 / 255, 252 / 255, 159 / 255),
// ];

const lights = () =>
  new Array(2).fill(undefined).map(() => {
    return {
      radius: 400,
      theta: 2 * Math.PI * Math.random(),
      // phi: 2 * Math.PI * Math.random(),
      phi: 0,
      thetaSpeed: 3 * Math.random(),
      phiSpeed: 0,
      // color: colors[i],
      color: new Color(Math.random(), Math.random(), Math.random()),
      intensity: 10000,
    };
  });

const objects = [
  [Skull, { scale: 100 }],
  [Pumpkin, { scale: 400 }],
  [Ghost, { scale: 100 }],
  [Bat, { scale: 120 }],
] as const;

function Model() {
  const ref = React.useRef<Group>(null);
  const materialRef = React.useRef<MeshStandardMaterial>(null);
  const [[Obj, props], setObj] = React.useState<(typeof objects)[0]>(
    objects[0],
  );
  const nextObject = React.useCallback(() => {
    setObj((o: any): any => objects[(objects.indexOf(o) + 1) % objects.length]);
  }, [setObj]);

  useControls({
    model: button(nextObject),
  });

  const period = 3;
  useFrame(({ clock }) => {
    ref.current!.rotation.y = clock.elapsedTime;

    materialRef.current!.clippingPlanes?.forEach((plane) => {
      plane.constant = Math.sin((2 * Math.PI * clock.elapsedTime) / period);
    });
  });

  return (
    <Obj {...props} ref={ref}>
      <meshStandardMaterial
        ref={materialRef}
        clippingPlanes={[new Plane(new Vector3(0, 0, -1), 0.5)]}
      />
    </Obj>
  );
}

const Halloween = React.memo(function Dusen() {
  const groupRef = React.useRef<Group>(null);
  const lightsRef = React.useRef<PointLight[]>([]);

  const [, setControl] = useControls(() => ({
    light: {
      min: 0,
      max: 100,
      value: 10,
      onChange: (v) => {
        lightsRef.current.forEach((l) => {
          l.intensity = v * 10000;
        });
      },
    },
  }));

  const setSize = React.useCallback((v: number) => {
    groupRef.current!.scale.set(v, v, v);
  }, []);

  useSpectrum({
    light: (v) => {
      setControl({ light: v });
    },
    size: setSize,
  });

  return (
    <>
      <group ref={groupRef}>
        <Model />
      </group>
      {lights().map((s, i) => (
        <Orbits key={i} seed={s}>
          <pointLight
            ref={(e) => {
              lightsRef.current[i] = e!;
            }}
            color={s.color}
          />
        </Orbits>
      ))}
    </>
  );
});

export const skullConfig = {
  name: 'skull',
  Contents: Halloween,
} as const satisfies Config;
