import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { ShaderMaterial, ShaderMaterialParameters } from 'three';

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
    <mesh>
      <planeGeometry args={[size.width, size.height, 400, 400]} />
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
