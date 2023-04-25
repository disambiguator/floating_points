import { useFrame, useThree } from '@react-three/fiber';
import type { GetStaticProps } from 'next';
import React from 'react';
import { FiberScene } from 'components/scene';
import Shader from 'components/shader';
import Page from '../../components/page';
import { shaders } from '../../components/scenes';

export const getStaticProps: GetStaticProps = async (context) => {
  const { name } = context.params as { name: string };
  return {
    props: { name },
  };
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(shaders).map((name) => ({ params: { name } })),
    fallback: false,
  };
}

export function ShaderView({ children }: { children: React.ReactNode }) {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Shader>{children}</Shader>
        </FiberScene>
      </div>
    </Page>
  );
}

export const DefaultShader = ({ name }: { name: keyof typeof shaders }) => {
  const viewport = useThree((t) => t.viewport);
  const shader = shaders[name]();

  useFrame(({ clock }) => {
    shader.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <shaderMaterial args={[shader]} uniforms-aspect-value={viewport.aspect} />
  );
};

export default function ShaderPage({ name }: { name: keyof typeof shaders }) {
  return (
    <ShaderView>
      <DefaultShader name={name} />
    </ShaderView>
  );
}
