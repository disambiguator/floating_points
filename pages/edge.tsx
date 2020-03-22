import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Spiro = dynamic(() => import('../components/edge'), { ssr: false });

  return <Spiro />;
};
