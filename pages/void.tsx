import React from 'react';
import dynamic from 'next/dynamic';

export default function PerlinField() {
  const Spiro = dynamic(() => import('../components/void'), {
    ssr: false,
  });

  return <Spiro />;
}
