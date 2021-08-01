import { GetStaticProps } from 'next';
import React from 'react';
import { FiberScene } from 'components/scene';
import Shader from 'components/shader';
import Page from '../../components/page';
import { shaders } from '../../components/scenes';

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
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Shader name={name} />
        </FiberScene>
      </div>
    </Page>
  );
}
