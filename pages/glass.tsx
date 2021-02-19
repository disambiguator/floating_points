import React from 'react';
import dynamic from 'next/dynamic';

export default function Walker() {
  const Dusen = dynamic(() => import('../components/glass'), {
    ssr: false,
  });
  return <Dusen />;
}
