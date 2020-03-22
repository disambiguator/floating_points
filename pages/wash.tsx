import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Spiro = dynamic(() => import('../components/wash'), { ssr: false });

  return <Spiro />;
};
