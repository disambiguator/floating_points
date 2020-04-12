import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  // const Spiro = dynamic(() => import('../components/spiro-fiber'), {
  const Spiro = dynamic(() => import('../components/spiro-fiber'), {
    ssr: false,
  });
  return <Spiro />;
};
