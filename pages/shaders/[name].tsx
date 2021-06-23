import { useFrame, useThree } from '@react-three/fiber';
import { GetStaticProps } from 'next';
import { Perf } from 'r3f-perf';
import React, { useRef } from 'react';
import { ShaderMaterial, ShaderMaterialParameters } from 'three';
import Page from '../../components/page';
import { FiberScene } from '../../components/scene';
import { shaders } from '../../components/scenes';

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

export const getStaticProps: GetStaticProps = async (context) => {
  const params = context.params as { name: string };
  return {
    props: params,
  };
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(shaders).map((b) => ({ params: { name: b } })),
    fallback: false,
  };
}

export default function ShaderPage({ name }: { name: string }) {
  // @ts-ignore
  const shader = shaders[name];

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
