import React from 'react';
import dynamic from 'next/dynamic';

export default function Divide() {
  const Spiro = dynamic(() => import('../components/divide'), { ssr: false });

  return <Spiro />;
}
