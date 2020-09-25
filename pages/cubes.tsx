import React from 'react';
import dynamic from 'next/dynamic';

export default function Cubes() {
  const Spiro = dynamic(() => import('../components/cubes'), { ssr: false });

  return <Spiro />;
}
