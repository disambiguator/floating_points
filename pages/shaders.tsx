import React, { useRef } from 'react';
import { useThree, useFrame } from 'react-three-fiber';
import { ShaderMaterial } from 'three';
import FbmShader from '../lib/shaders/fbm';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { useRouter } from 'next/router';

const allShaders = {
  fbm: FbmShader,
};
type ShaderName = keyof typeof allShaders;

const Shaders = React.memo(function Shader({
  shaderName,
}: {
  shaderName: ShaderName;
}) {
  const { aspect, size, clock } = useThree();
  const ref = useRef<ShaderMaterial>();

  useFrame(() => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[allShaders[shaderName]]}
        uniforms-aspect-value={aspect}
      />
    </mesh>
  );
});

export default function ShaderPage() {
  const { query } = useRouter();
  const shaderName = query.name as ShaderName;

  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Shaders shaderName={shaderName} />
        </FiberScene>
      </div>
    </Page>
  );
}
