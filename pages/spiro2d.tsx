import dynamic from 'next/dynamic';
import React from 'react';

export default function Spiro2d() {
  const Spiro = dynamic(() => import('../components/spiro2d'), { ssr: false });

  return <Spiro />;
}
