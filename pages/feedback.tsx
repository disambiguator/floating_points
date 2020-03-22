import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Spiro = dynamic(() => import('../components/feedback'), { ssr: false });

  return <Spiro />;
};
