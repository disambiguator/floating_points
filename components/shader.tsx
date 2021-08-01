import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { ShaderMaterial, ShaderMaterialParameters } from 'three';
import { shaders } from 'components/scenes';

const Shaders = React.memo(function Shader({
  shader,
}: {
  shader: ShaderMaterialParameters;
}) {
  const { viewport, size } = useThree();
  const ref = useRef<ShaderMaterial>();

  useFrame(({ clock }) => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </mesh>
  );
});

export default function Shader({ name }: { name: string }) {
  const shader = shaders[name];

  return shader ? <Shaders shader={shader} /> : <div>Invalid shader name</div>;
}
