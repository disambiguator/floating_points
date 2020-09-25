import React from 'react';
import dynamic from 'next/dynamic';

export default function Spiro2d() {
  const Spiro = dynamic(() => import('../components/spiro2d'), { ssr: false });

  return <Spiro />;
}
