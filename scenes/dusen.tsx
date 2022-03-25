import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useRef, useState } from 'react';
import { ShaderMaterial } from 'three';
import { scaleMidi } from '../lib/midi';
import DusenShader from '../lib/shaders/dusen';
import { Config, useSpectrum } from '../lib/store';

const Dusen = React.memo(function Dusen() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial>();
  const [radius, setRadius] = useState(0);
  useControls('dusen', {
    radius: {
      value: 27,
      min: 0,
      max: 127,
      onChange: setRadius,
    },
  });
  useSpectrum({ radius: setRadius });

  useFrame(({ clock }) => {
    if (ref.current) ref.current.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[DusenShader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-radius-value={scaleMidi(radius, 0, 1)}
      />
    </mesh>
  );
});

export const dusenConfig: Config = {
  name: 'dusen',
  Contents: Dusen,
  params: {},
};
