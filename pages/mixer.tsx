import React from 'react';
import dynamic from 'next/dynamic';

export default function Mixer() {
  const Spiro = dynamic(() => import('../components/spiro'), { ssr: false });

  return <Spiro />;
}
