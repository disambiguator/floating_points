import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Mix = dynamic(() => import('../components/mixer'), { ssr: false });

  return <Mix />;
};
