import dynamic from 'next/dynamic';
import React from 'react';

export default function Cubedraw() {
  const Dusen = dynamic(() => import('../components/cubedraw'), {
    ssr: false,
  });
  return <Dusen />;
}
