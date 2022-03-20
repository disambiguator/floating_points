import dynamic from 'next/dynamic';
import React from 'react';
import { P5WrapperProps } from 'react-p5-wrapper';

export const ReactP5Wrapper = dynamic(
  () => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper),
  {
    ssr: false,
  },
) as React.NamedExoticComponent<P5WrapperProps>;
