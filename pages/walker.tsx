import dynamic from 'next/dynamic';
import React from 'react';

export default function Walker() {
  const Dusen = dynamic(() => import('../components/walker'), {
    ssr: false,
  });
  return <Dusen />;
}
