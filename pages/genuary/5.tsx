import dynamic from 'next/dynamic';
import React from 'react';

export default function Cubedraw() {
  const Dusen = dynamic(() => import('../../components/5_component'), {
    ssr: false,
  });
  return <Dusen />;
}
