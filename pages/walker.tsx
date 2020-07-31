import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Dusen = dynamic(() => import('../components/walker'), {
    ssr: false,
  });
  return <Dusen />;
};
