import { useFrame, useThree } from '@react-three/fiber';
import { isEmpty } from 'lodash';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import MixerPage from '../components/mixer';
import { useStateUpdate, useStore } from '../lib/store';

type TunnelParams = {
  size: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
};
const Tunnel = React.memo(function Tunnel(params: TunnelParams) {
  const meshRef = useRef<THREE.Mesh>();
  const material = useMemo(() => new THREE.MeshPhongMaterial(), []);
  const h = Math.random() * 360;
  const l = Math.random();
  const scene = useThree((t) => t.scene);
  useEffect(() => {
    const { size, position, rotation } = params;
    const meshA = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    meshA.position.set(...position);
    meshA.updateMatrix();

    const cutout = 0.1 * size[0];
    const meshB = new THREE.Mesh(
      new THREE.BoxGeometry(cutout, cutout, size[0] * 2),
    );
    meshB.position.set(...position);
    meshB.updateMatrix();

    meshRef.current = CSG.subtract(meshA, meshB);
    meshRef.current.rotation.set(...rotation);
    scene.add(meshRef.current);

    return () => {
      const mesh = meshRef.current;
      if (mesh) scene.remove(mesh);
    };
  }, [scene, params, material]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { audioEnabled, spectrum } = useStore.getState();
    if (audioEnabled) {
      const { frequencyData } = spectrum;
      if (isEmpty(frequencyData)) return;
      mesh.rotation.z += Math.pow(frequencyData[params.index] / 700, 2);
      material.color.setHSL(h, frequencyData[params.index] / 10, l);
    }
  });
  return <></>;
});

const Control = () => {
  const lightRef = useRef<THREE.PointLight>();
  useFrame(({ camera }) => {
    const { spectrum } = useStore.getState();
    if (spectrum.volume > 10) camera.position.z -= spectrum.volume / 100;
    if (camera.position.z < 150) camera.position.z = 1000;

    const light = lightRef.current;
    if (!light) return;
    light.position.set(...camera.position.toArray());
    light.intensity = spectrum.bass / 1000;
  });

  const zSize = 5;
  const tunnels: Array<TunnelParams> = new Array(512)
    .fill(undefined)
    .map((_, i) => ({
      position: [0, 0, 100 + i * zSize],
      size: [100, 100, zSize],
      rotation: [0, 0, (i * Math.PI) / 16],
      index: i,
    }));
  return (
    <>
      {tunnels.map((t, i) => {
        return <Tunnel key={i} {...t} />;
      })}
      <pointLight ref={lightRef} />
    </>
  );
};

export const controlConfig = {
  name: 'control' as const,
  Contents: Control,
  params: {},
};

export default function ControlPage() {
  useStateUpdate({
    env: controlConfig,
    audioEnabled: true,
  });

  return <MixerPage />;
}
