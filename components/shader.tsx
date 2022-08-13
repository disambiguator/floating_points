import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import type { ShaderMaterial, ShaderMaterialParameters } from 'three';

const Shaders = React.memo(function Shader({
  shader,
}: {
  shader: ShaderMaterialParameters;
}) {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
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

export default function Shader({
  shader,
}: {
  shader: ShaderMaterialParameters;
}) {
  return <Shaders shader={shader} />;
}
