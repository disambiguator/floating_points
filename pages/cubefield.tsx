import dynamic from 'next/dynamic';
import React from 'react';

export default function Cubefield() {
  const Dusen = dynamic(() => import('../components/cubefield'), {
    ssr: false,
  });
  return <Dusen />;
}
