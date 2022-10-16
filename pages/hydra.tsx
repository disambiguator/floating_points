import dynamic from 'next/dynamic';
import React from 'react';

export default function Wash() {
  const Spiro = dynamic(() => import('../components/hydra'), { ssr: false });

  return <Spiro />;
}
