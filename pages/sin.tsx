import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Spiro = dynamic(() => import('../components/sin'), { ssr: false });

  return <Spiro />;
};
