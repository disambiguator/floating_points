import dynamic from 'next/dynamic';
import React from 'react';

export default function Bendy() {
  const Spiro = dynamic(() => import('../components/bendy'), { ssr: false });

  return <Spiro />;
}
