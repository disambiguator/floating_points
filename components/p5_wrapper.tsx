import dynamic from 'next/dynamic';
import { type ReactP5Wrapper as ReactP5WrapperType } from 'react-p5-wrapper';

export const ReactP5Wrapper = dynamic(
  () => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper),
  {
    ssr: false,
  },
) as typeof ReactP5WrapperType;
