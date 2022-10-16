import type { GetStaticProps } from 'next';
import Mixer from 'components/mixer';
import { scenes } from '../../components/scenes';

export const getStaticProps: GetStaticProps = async (context) => {
  const params = context.params as { name: string };
  return {
    props: params,
  };
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(scenes)
      .filter((name) => name !== 'bars')
      .map((name) => ({ params: { name } })),
    fallback: false,
  };
}

export default Mixer;
