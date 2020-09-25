import React from 'react';
import dynamic from 'next/dynamic';

export default function Spiro() {
  const Spiro = dynamic(() => import('../components/spiro'), {
    ssr: false,
  });
  return <Spiro />;
}
