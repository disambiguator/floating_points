import dynamic from 'next/dynamic';
import React from 'react';

export default function Divide() {
  const Spiro = dynamic(() => import('../components/divide'), { ssr: false });

  return <Spiro />;
}
