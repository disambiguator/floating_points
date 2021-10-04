import { GetStaticProps } from 'next';
import React from 'react';
import { ShaderMaterialParameters } from 'three';
import { FiberScene } from 'components/scene';
import Shader from 'components/shader';
import Page from '../../components/page';
import { shaders } from '../../components/scenes';

export const getStaticProps: GetStaticProps = async (context) => {
  const { name } = context.params as { name: string };
  return {
    props: { shader: shaders[name] },
  };
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(shaders).map((name) => ({ params: { name } })),
    fallback: false,
  };
}

export default function ShaderPage({
  shader,
}: {
  shader: ShaderMaterialParameters;
}) {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Shader shader={shader} />
        </FiberScene>
      </div>
    </Page>
  );
}
