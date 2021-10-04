import { GetStaticProps } from 'next';
import React from 'react';
import Mixer from 'components/mixer';
import { sceneName, scenes } from '../../components/scenes';

export const getStaticProps: GetStaticProps = async (context) => {
  const params = context.params as { name: string };
  return {
    props: params,
  };
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(scenes()).map((b) => ({ params: { name: b } })),
    fallback: false,
  };
}

export default function ShaderPage({ name }: { name: sceneName }) {
  return <Mixer name={name} />;
}
