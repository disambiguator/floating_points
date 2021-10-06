import { GetStaticProps } from 'next';
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

export default function ShaderPage({ name }: { name: string }) {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Shader shader={shaders[name]} />
        </FiberScene>
      </div>
    </Page>
  );
}
