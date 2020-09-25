import React from 'react';
import dynamic from 'next/dynamic';

export default function Sin() {
  const Spiro = dynamic(() => import('../components/sin'), { ssr: false });

  return <Spiro />;
}
