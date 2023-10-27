import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Color, Group, MeshStandardMaterial, Plane, Vector3 } from 'three';
import { type Config, useSpectrum } from 'lib/store';
import Pumpkin from 'models/Pumpkin';
import Skull from 'models/Skull';
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

const ScaledPumpkin = forwardRef(function ScaledPumpkin(
  props,
  ref: ForwardedRef<Group>,
) {
  return <Pumpkin scale={4} ref={ref} {...props} />;
});

const objects = [Skull, ScaledPumpkin];

function Model() {
  const ref = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [Obj, setObj] = useState<(typeof objects)[0]>(Skull);
  const nextObject = useCallback(() => {
    setObj((o: any) => objects[(objects.indexOf(o) + 1) % objects.length]);
  }, [setObj]);

  useControls({
    model: button(nextObject),
  });

  const period = 3;
  useFrame(({ clock }) => {
    ref.current!.rotation.y = clock.elapsedTime;

    materialRef.current!.clippingPlanes.forEach((plane) => {
      plane.constant = Math.sin((2 * Math.PI * clock.elapsedTime) / period);
    });
  });

  return (
    <Obj ref={ref}>
      <meshStandardMaterial
        ref={materialRef}
        clippingPlanes={[new Plane(new Vector3(0, 0, -1), 0.5)]}
      />
    </Obj>
  );
}

const Halloween = React.memo(function Dusen() {
  const groupRef = useRef<Group>(null);

  const [{ light }, setControl] = useControls(() => ({
    light: { min: 0, max: 100, value: 10 },
  }));

  const setSize = useCallback((v: number) => {
    groupRef.current!.scale.set(v, v, v);
  }, []);

  useSpectrum({
    light: (v) => {
      setControl({ light: v * 0.1 });
    },
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
};
