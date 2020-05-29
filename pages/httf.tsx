import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Dusen = dynamic(() => import('../components/httf'), {
    ssr: false,
  });
  return <Dusen />;
};
