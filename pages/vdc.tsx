import React from 'react';
import dynamic from 'next/dynamic';

export default () => {
  const Dusen = dynamic(() => import('../components/vdc'), { ssr: false });
  return <Dusen />;
};
