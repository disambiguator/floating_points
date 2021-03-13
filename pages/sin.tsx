import dynamic from 'next/dynamic';
import React from 'react';

export default function Sin() {
  const Spiro = dynamic(() => import('../components/sin'), { ssr: false });

  return <Spiro />;
}
