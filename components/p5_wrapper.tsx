import dynamic from 'next/dynamic';
import type React from 'react';
import type { P5WrapperProps } from 'react-p5-wrapper';

export const ReactP5Wrapper = dynamic(
  () => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper),
  {
    ssr: false,
  },
) as React.NamedExoticComponent<P5WrapperProps>;
