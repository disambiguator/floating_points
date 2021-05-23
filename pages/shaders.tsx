import { useFrame, useThree } from '@react-three/fiber';
import { useRouter } from 'next/router';
import { Perf } from 'r3f-perf';
import React, { useRef } from 'react';
import { ShaderMaterial, ShaderMaterialParameters } from 'three';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { shaders } from '../components/scenes';

const Shaders = React.memo(function Shader({
  shader,
}: {
  shader: ShaderMaterialParameters;
}) {
  const { viewport, size, clock } = useThree();
  const ref = useRef<ShaderMaterial>();

  useFrame(() => {
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

export default function ShaderPage() {
  const { query } = useRouter();
  const shaderName = query.name;

  // @ts-ignore
  const shader = shaders[shaderName];

  return (
    <Page>
      {shader ? (
        <div style={{ height: '90vh', width: '90vh' }}>
          <FiberScene>
            <Shaders shader={shader} />
            <Perf />
          </FiberScene>
        </div>
      ) : (
        'Invalid shader name'
      )}
    </Page>
  );
}
